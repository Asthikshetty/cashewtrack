from rest_framework import serializers
from .models import RawLot, SteamingBatch, ShellingBatch

class RawLotSerializer(serializers.ModelSerializer):
    expected_kernel_output = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    net_weight = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = RawLot
        fields = '__all__'
        read_only_fields = ['lot_number', 'created_by']

class SteamingBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = SteamingBatch
        fields = '__all__'
        read_only_fields = ['id', 'created_by']

class ShellingBatchSerializer(serializers.ModelSerializer):
    total_output = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    recovery_percent = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    loss_percent = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    efficiency_kg_per_hour = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = ShellingBatch
        fields = '__all__'
        read_only_fields = ['id']