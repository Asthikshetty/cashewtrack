from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Avg
from inventory.models import Inventory
from .models import ShellingBatch

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisorOrOwner]
    
    def get(self, request):
        # Total raw stock
        raw_stock = Inventory.objects.filter(item_type='RAW_CASHEW').aggregate(total=Sum('quantity'))['total'] or 0
        
        # Total kernel produced (sum of graded items)
        graded_items = Inventory.objects.filter(item_type__startswith='GRADED_').aggregate(total=Sum('quantity'))['total'] or 0
        
        # Overall recovery % (average across shelling batches)
        recovery_avg = ShellingBatch.objects.aggregate(avg=Avg('recovery_percent'))['avg'] or 0
        
        # Inventory by grade
        grade_inventory = Inventory.objects.filter(item_type__startswith='GRADED_').values('item_type').annotate(total=Sum('quantity'))
        
        # Supplier performance (placeholder)
        # Operator efficiency (placeholder)
        
        return Response({
            'total_raw_stock': raw_stock,
            'total_kernel_produced': graded_items,
            'overall_recovery_percent': recovery_avg,
            'inventory_by_grade': list(grade_inventory),
        })