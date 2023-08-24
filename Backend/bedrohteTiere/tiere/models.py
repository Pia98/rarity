from django.db import models
import base64
# Create your models here.

class Animals(models.Model):
    name = models.CharField(max_length=50)
    animal_type = models.CharField(max_length=50)
    coordinates = models.CharField(max_length=100)
    lat = models.DecimalField(max_digits=8, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    threat_level = models.CharField(max_length=50)
    _image = models.TextField(blank=True, db_column='image')
    text = models.CharField(max_length=2000)
    remaining_animals_numbers = models.IntegerField()
    cause_danger = models.CharField(max_length=300)
    habitat = models.CharField(max_length=200)

    def __str__(self):
        return self.name

    def set_data(self, image):
        self._image = base64.encodestring(image)

    def get_data(self):
        return base64.decodestring(self._image)

    image = property(get_data, set_data)


