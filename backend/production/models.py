from django.db import models

# Create your models here.
import uuid
from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from suppliers.models import Supplier
from django.conf import settings

class RawLot(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    lot_number = models.CharField(max_length=50, unique=True, editable=False)
    purchase_order_number = models.CharField(max_length=100)
    purchase_date = models.DateField()
    received_date = models.DateField()
    warehouse_location = models.CharField(max_length=100)
    
    # Weights
    gross_weight = models.DecimalField(max_digits=10, decimal_places=2)
    tare_weight = models.DecimalField(max_digits=10, decimal_places=2)
    net_weight = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    
    # Quality metrics
    moisture_percent = models.DecimalField(max_digits=5, decimal_places=2)
    kor_percent = models.DecimalField(max_digits=5, decimal_places=2)  # Kernel Output Ratio
    foreign_material_percent = models.DecimalField(max_digits=5, decimal_places=2)
    sampling_report = models.TextField(blank=True)
    sampling_attachment = models.FileField(upload_to='sampling_reports/', blank=True, null=True)
    
    # Computed
    expected_kernel_output = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Auto-generate lot number on first save
        if not self.lot_number:
            last_lot = RawLot.objects.order_by('-id').first()
            next_id = (last_lot.id + 1) if last_lot else 1
            self.lot_number = f"LOT-{timezone.now().year}-{next_id:04d}"
        
        # Auto-calculate net weight
        self.net_weight = self.gross_weight - self.tare_weight
        
        # Auto-calculate expected kernel output
        self.expected_kernel_output = (self.net_weight * self.kor_percent / 100) * (1 - self.moisture_percent / 100)
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.lot_number


class SteamingBatch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    raw_lot = models.ForeignKey(RawLot, on_delete=models.PROTECT)
    feed_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    temperature = models.DecimalField(max_digits=5, decimal_places=2, help_text="°C")
    pressure = models.DecimalField(max_digits=5, decimal_places=2, help_text="bar")
    duration = models.IntegerField(help_text="minutes")
    date = models.DateField()
    shift = models.CharField(max_length=20, choices=[('MORNING','Morning'),('AFTERNOON','Afternoon'),('NIGHT','Night')])
    machine_id = models.CharField(max_length=50)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def clean(self):
        # Validation: Cannot exceed available raw stock
        from inventory.models import Inventory
        available = Inventory.objects.get_raw_stock(self.raw_lot_id)
        if self.feed_quantity > available:
            raise ValidationError(f"Feed quantity ({self.feed_quantity}) exceeds available raw stock ({available})")
    
    @transaction.atomic
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        # Update inventory (deduct raw, add steamed)
        from inventory.services import process_inventory_transaction
        process_inventory_transaction(
            item_type='RAW_CASHEW',
            reference_id=self.id,
            transaction_type='OUT',
            quantity=-self.feed_quantity,
            source_id=self.raw_lot_id
        )
        process_inventory_transaction(
            item_type='STEAMED_CASHEW',
            reference_id=self.id,
            transaction_type='IN',
            quantity=self.feed_quantity,
            batch_id=self.id
        )


class ShellingBatch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    steaming_batch = models.ForeignKey(SteamingBatch, on_delete=models.PROTECT)
    operator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='shelling_ops')
    machine_id = models.CharField(max_length=50)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    input_weight = models.DecimalField(max_digits=10, decimal_places=2)
    uncut_output = models.DecimalField(max_digits=10, decimal_places=2, help_text="Whole kernels after shelling")
    unscoup_output = models.DecimalField(max_digits=10, decimal_places=2, help_text="Broken pieces")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def total_output(self):
        return self.uncut_output + self.unscoup_output
    
    @property
    def recovery_percent(self):
        if self.input_weight > 0:
            return (self.total_output / self.input_weight) * 100
        return 0
    
    @property
    def loss_percent(self):
        return 100 - self.recovery_percent
    
    @property
    def efficiency_kg_per_hour(self):
        if self.start_time and self.end_time:
            hours = (self.end_time - self.start_time).total_seconds() / 3600
            if hours > 0:
                return self.total_output / hours
        return 0
    
    def clean(self):
        # Cannot exceed available steamed stock
        from inventory.models import Inventory
        available = Inventory.objects.get_steamed_stock(self.steaming_batch_id)
        if self.input_weight > available:
            raise ValidationError(f"Input weight exceeds available steamed stock ({available})")
    
    @transaction.atomic
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        from inventory.services import process_inventory_transaction
        # Deduct steamed input
        process_inventory_transaction(
            item_type='STEAMED_CASHEW',
            reference_id=self.id,
            transaction_type='OUT',
            quantity=-self.input_weight,
            batch_id=self.steaming_batch_id
        )
        # Add shelled output
        process_inventory_transaction(
            item_type='SHELLED_CASHEW',
            reference_id=self.id,
            transaction_type='IN',
            quantity=self.total_output,
            batch_id=self.id
        )


class DryingBatch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shelling_batch = models.ForeignKey(ShellingBatch, on_delete=models.PROTECT)
    input_weight = models.DecimalField(max_digits=10, decimal_places=2)
    temperature = models.DecimalField(max_digits=5, decimal_places=2, help_text="°C")
    duration = models.IntegerField(help_text="hours")
    output_weight = models.DecimalField(max_digits=10, decimal_places=2)
    moisture_after = models.DecimalField(max_digits=5, decimal_places=2, help_text="%")
    oven_id = models.CharField(max_length=50)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def weight_reduction_percent(self):
        if self.input_weight > 0:
            return ((self.input_weight - self.output_weight) / self.input_weight) * 100
        return 0
    
    @property
    def moisture_reduction(self):
        # Needs original moisture from earlier stage? Store or pass.
        # For simplicity, assume we store original moisture elsewhere.
        return 0  # Placeholder
    
    @property
    def drying_loss(self):
        return self.input_weight - self.output_weight
    
    @transaction.atomic
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        from inventory.services import process_inventory_transaction
        process_inventory_transaction(
            item_type='SHELLED_CASHEW',
            reference_id=self.id,
            transaction_type='OUT',
            quantity=-self.input_weight,
            batch_id=self.shelling_batch_id
        )
        process_inventory_transaction(
            item_type='DRIED_CASHEW',
            reference_id=self.id,
            transaction_type='IN',
            quantity=self.output_weight,
            batch_id=self.id
        )


class PeelingBatch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    drying_batch = models.ForeignKey(DryingBatch, on_delete=models.PROTECT)
    operator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    machine_type = models.CharField(max_length=50)
    input_weight = models.DecimalField(max_digits=10, decimal_places=2)
    whole_kernels = models.DecimalField(max_digits=10, decimal_places=2)
    broken_kernels = models.DecimalField(max_digits=10, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def total_output(self):
        return self.whole_kernels + self.broken_kernels
    
    @property
    def peeling_percent(self):
        if self.input_weight > 0:
            return (self.total_output / self.input_weight) * 100
        return 0
    
    @property
    def breakage_percent(self):
        if self.total_output > 0:
            return (self.broken_kernels / self.total_output) * 100
        return 0
    
    @property
    def loss(self):
        return self.input_weight - self.total_output
    
    @transaction.atomic
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        from inventory.services import process_inventory_transaction
        process_inventory_transaction(
            item_type='DRIED_CASHEW',
            reference_id=self.id,
            transaction_type='OUT',
            quantity=-self.input_weight,
            batch_id=self.drying_batch_id
        )
        # Add peeled kernels (whole+broken) as separate inventory items
        process_inventory_transaction(
            item_type='PEELED_WHOLE',
            reference_id=self.id,
            transaction_type='IN',
            quantity=self.whole_kernels,
            batch_id=self.id
        )
        process_inventory_transaction(
            item_type='PEELED_BROKEN',
            reference_id=self.id,
            transaction_type='IN',
            quantity=self.broken_kernels,
            batch_id=self.id
        )


class GradingRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    peeling_batch = models.ForeignKey(PeelingBatch, on_delete=models.PROTECT)
    w180 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    w210 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    w240 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    w320 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    broken = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    splits = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def total_graded(self):
        return self.w180 + self.w210 + self.w240 + self.w320 + self.broken + self.splits
    
    def clean(self):
        # Total graded cannot exceed available peeled stock
        from inventory.models import Inventory
        available = Inventory.objects.get_peeled_stock(self.peeling_batch_id)
        if self.total_graded > available:
            raise ValidationError(f"Total graded ({self.total_graded}) exceeds available peeled stock ({available})")
    
    @transaction.atomic
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        from inventory.services import process_inventory_transaction
        # Deduct peeled whole stock
        process_inventory_transaction(
            item_type='PEELED_WHOLE',
            reference_id=self.id,
            transaction_type='OUT',
            quantity=-self.total_graded,
            batch_id=self.peeling_batch_id
        )
        # Add graded inventory by grade
        grades = ['W180','W210','W240','W320','BROKEN','SPLITS']
        for grade in grades:
            qty = getattr(self, grade.lower())
            if qty > 0:
                process_inventory_transaction(
                    item_type=f'GRADED_{grade}',
                    reference_id=self.id,
                    transaction_type='IN',
                    quantity=qty,
                    grade=grade,
                    batch_id=self.id
                )


class PackagingRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grading_record = models.ForeignKey(GradingRecord, on_delete=models.PROTECT)
    finished_good_lot_number = models.CharField(max_length=50, unique=True, editable=False)
    packing_date = models.DateField()
    shift = models.CharField(max_length=20)
    grade = models.CharField(max_length=20)  # e.g., W180, W210
    packing_material_batch = models.CharField(max_length=100)
    net_weight_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=25.00)  # 25kg bags
    storage_location = models.CharField(max_length=100)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def total_units(self):
        # Get available quantity of that grade from inventory
        from inventory.models import Inventory
        stock = Inventory.objects.filter(item_type=f'GRADED_{self.grade}').first()
        if stock:
            return int(stock.quantity / self.net_weight_per_unit)
        return 0
    
    def save(self, *args, **kwargs):
        if not self.finished_good_lot_number:
            last = PackagingRecord.objects.order_by('-created_at').first()
            next_id = (last.id.hex[:4] if last else '0001')
            self.finished_good_lot_number = f"FG-{timezone.now().strftime('%Y%m%d')}-{next_id}"
        super().save(*args, **kwargs)