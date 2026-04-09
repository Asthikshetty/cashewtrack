from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Supplier
from .serializers import SupplierSerializer
from users.permissions import IsSupervisorUser

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsSupervisorUser]