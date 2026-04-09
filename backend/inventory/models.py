from django.db import models

# Create your models here.
import uuid
from django.db import models
from django.core.exceptions import ValidationError

class Inventory(models.Model):
    ITEM_TYPES = [
        ('RAW_CASHEW', 'Raw Cashew'),
        ('STEAMED_CASHEW', 'Steamed Cashew'),
        ('SHELLED_CASHEW', 'Shelled Cashew'),
        ('DRIED_CASHEW', 'Dried Cashew'),
        ('PEELED_WHOLE', 'Peeled Whole'),
        ('PEELED_BROKEN', 'Peeled Broken'),
        ('GRADED_W180', 'Graded W180'),
        ('GRADED_W210', 'Graded W210'),
        ('GRADED_W240', 'Graded W240'),
        ('GRADED_W320', 'Graded W320'),
        ('GRADED_BROKEN', 'Graded Broken'),
        ('GRADED_SPLITS', 'Graded Splits'),
    ]
    
    item_type = models.CharField(max_length=30, choices=ITEM_TYPES)
    grade = models.CharField(max_length=20, blank=True, null=True)  # For graded items
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    location = models.CharField(max_length=100, default='MAIN_WAREHOUSE')
    
    # Optional foreign keys to track which batch this stock belongs to
    raw_lot = models.ForeignKey('production.RawLot', on_delete=models.SET_NULL, null=True, blank=True)
    batch_id = models.UUIDField(null=True, blank=True)  # Generic reference
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Inventories'
        unique_together = [['item_type', 'grade', 'raw_lot', 'batch_id']]
    
    @classmethod
    def get_raw_stock(cls, raw_lot_id):
        obj = cls.objects.filter(item_type='RAW_CASHEW', raw_lot_id=raw_lot_id).first()
        return obj.quantity if obj else 0
    
    @classmethod
    def get_steamed_stock(cls, batch_id):
        obj = cls.objects.filter(item_type='STEAMED_CASHEW', batch_id=batch_id).first()
        return obj.quantity if obj else 0
    
    @classmethod
    def get_peeled_stock(cls, batch_id):
        obj = cls.objects.filter(item_type='PEELED_WHOLE', batch_id=batch_id).first()
        return obj.quantity if obj else 0


class InventoryTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item_type = models.CharField(max_length=30)
    grade = models.CharField(max_length=20, blank=True, null=True)
    transaction_type = models.CharField(max_length=3, choices=TRANSACTION_TYPES)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    reference_id = models.UUIDField()  # ID of the batch that caused this transaction
    raw_lot = models.ForeignKey('production.RawLot', on_delete=models.SET_NULL, null=True, blank=True)
    batch_id = models.UUIDField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    def clean(self):
        if self.transaction_type == 'OUT' and self.quantity > 0:
            raise ValidationError("OUT transactions must have negative quantity")
        if self.transaction_type == 'IN' and self.quantity < 0:
            raise ValidationError("IN transactions must have positive quantity")