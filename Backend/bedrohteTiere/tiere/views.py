from rest_framework import status
from .models import Animals
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from .serializers import AnimalSerializer


# Create your views here.
def display(request):
    data = Animals.objects.all()
    response = {
        'animals': list(data.values('name', 'animal_type', 'image'))
    }
    return JsonResponse(response)


# Get
@api_view(['GET', 'POST'])
@csrf_exempt
def display_data(request):
    # GET
    if request.method == 'GET':
        animals = Animals.objects.all()
        serializer = AnimalSerializer(animals, many=True)
        return Response(serializer.data)
    # POST
    elif request.method == 'POST':
        serializer = AnimalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)


# GET PUT DELETE
@api_view(['GET', 'PUT', 'DELETE'])
@csrf_exempt
def display_id(request, id):
    try:
        animal = Animals.objects.get(id=id)
    except Animals.DoesNotExists:
        return Response(status=status.HTTP_404_NOT_FOUND)
        # GET
    if request.method == 'GET':
        serializer = AnimalSerializer(animal)
        return Response(serializer.data)
    # PUT
    elif request.method == 'PUT':
        serializer = AnimalSerializer(animal, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)
    #  DELETE
    if request.method == 'DELETE':
        animal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
