from rest_framework import permissions
from django.utils import timezone
from datetime import timedelta

class IsNotLocked(permissions.BasePermission):
    """Prevent updates to records older than 24 hours"""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Check if object has created_at
        if hasattr(obj, 'created_at'):
            lock_time = obj.created_at + timedelta(hours=24)
            if timezone.now() > lock_time:
                return False
        return True