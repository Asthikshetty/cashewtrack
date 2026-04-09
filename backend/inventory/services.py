from django.db import transaction
from .models import Inventory, InventoryTransaction

@transaction.atomic
def process_inventory_transaction(item_type, reference_id, transaction_type, quantity, raw_lot_id=None, batch_id=None, grade=None):
    # Determine filter criteria for existing inventory record
    filter_kwargs = {'item_type': item_type}
    if grade:
        filter_kwargs['grade'] = grade
    if raw_lot_id:
        filter_kwargs['raw_lot_id'] = raw_lot_id
    if batch_id:
        filter_kwargs['batch_id'] = batch_id
    
    inventory, created = Inventory.objects.get_or_create(
        defaults={'quantity': 0},
        **filter_kwargs
    )
    
    # Update quantity
    inventory.quantity += quantity
    if inventory.quantity < 0:
        raise ValueError(f"Insufficient stock for {item_type}: {inventory.quantity}")
    inventory.save()
    
    # Log transaction
    InventoryTransaction.objects.create(
        item_type=item_type,
        grade=grade,
        transaction_type=transaction_type,
        quantity=quantity,
        reference_id=reference_id,
        raw_lot_id=raw_lot_id,
        batch_id=batch_id
    )