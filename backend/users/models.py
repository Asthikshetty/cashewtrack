from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('OWNER', 'Owner'),
        ('SUPERVISOR', 'Supervisor'),
        ('OPERATOR', 'Operator'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='OPERATOR')
    
    def is_owner(self):
        return self.role == 'OWNER'
    
    def is_supervisor(self):
        return self.role == 'SUPERVISOR'
    
    def is_operator(self):
        return self.role == 'OPERATOR'