from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import RawLot
from .serializers import RawLotSerializer
from users.permissions import IsSupervisorUser
from .permissions import IsNotLocked

class RawLotViewSet(viewsets.ModelViewSet):
    queryset = RawLot.objects.all()
    serializer_class = RawLotSerializer
    permission_classes = [IsAuthenticated, IsSupervisorUser, IsNotLocked]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)