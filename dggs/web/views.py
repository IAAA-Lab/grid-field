from django.contrib.gis.geos import Polygon
from django.shortcuts import render
from .models import *
from django.core.serializers import serialize, json
from django.http import HttpResponse
import json

import services


def default_map(request):
    return render(request, 'default.html', {})

def geojson_lvl8(request):
    if request.GET.get('bbox', None):
        bbox = request.GET.get('bbox', None).strip()
        print("value is ", bbox)

        minx, miny, maxx, maxy = [float(i) for i in bbox.split(",")]
        extent = Polygon(((minx,miny),(minx,maxy),(maxx,maxy),(maxx,miny),(minx,miny)),  srid=4326)

    data_as_geojson = serialize('geojson', list(Res8Wgs84.objects.filter(geom__bboverlaps=extent)))
    return HttpResponse(data_as_geojson, content_type='json')


def geojson_lvl9(request):
    data_as_geojson = serialize('geojson', list(Res9Wgs84.objects.all()))
    return HttpResponse(data_as_geojson, content_type='json')


def main_gridpage(request):
    print(" IN Main_giridpage")
    context = {
        "grid": [],
    }
    context["grid"] = serialize('geojson', list(Res8Wgs84.objects.all()))

    return render(request, "default.html", context)

# from django.views.decorators.csrf import csrf_exempt
# @csrf_exempt

def add_records_to_db(request):

    # books_list = services.get_books('2009', 'edwards')
    # return render(request, 'books.html', books_list)

    if request.method == 'POST':
        boundary = ""
        dataList = json.loads(request.body)
        for index in range(len(dataList)):
            boundary = boundary + dataList[index]["id"]

        result = services.addRecordAPIcall(boundary)

    if result.status_code == 201:
        return HttpResponse('Record Added !')
    return HttpResponse('Error in addition !')