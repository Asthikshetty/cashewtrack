from django.db import models

# Create your models here.
from django.db import models

class Supplier(models.Model):
    name = models.CharField(max_length=200)
    region = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    contact_details = models.TextField()
    performance_rating = models.FloatField(default=0.0)  # Placeholder for future analytics
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name