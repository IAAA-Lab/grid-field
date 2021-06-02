from django.contrib.gis.geos import Polygon
from django.shortcuts import render
from .models import *
from django.core.serializers import serialize, json
from django.http import HttpResponse
import json
from django.contrib.auth.decorators import login_required

from . import rhealpix_services

@login_required
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
    if request.GET.get('bbox', None):
        bbox = request.GET.get('bbox', None).strip()
        print("value is ", bbox)

        minx, miny, maxx, maxy = [float(i) for i in bbox.split(",")]
        extent = Polygon(((minx,miny),(minx,maxy),(maxx,maxy),(maxx,miny),(minx,miny)),  srid=4326)

    data_as_geojson = serialize('geojson', list(Res9Wgs84.objects.filter(geom__bboverlaps=extent)))
    return HttpResponse(data_as_geojson, content_type='json')

@login_required
def main_gridpage(request):
    print(" IN Main_giridpage")
    context = {
        "grid": [],
    }
    context["grid"] = serialize('geojson', list(Res8Wgs84.objects.all()))

    return render(request, "default.html", context)

# from django.views.decorators.csrf import csrf_exempt
# @csrf_exempt

def download_all_records_csv(request):
    if request.method == 'GET':
        import requests
        import json
        import re
        import csv
        output = []

        url = "http://127.0.0.1:8000/bdatasets/"
        mongo_response = requests.get(url)
        json_response = json.loads(mongo_response.text)
        for record in json_response:
            row = {}
            cells = record["boundary_data_set"][0]["boundary"]

            for cell in re.findall('[A-Z][^A-Z]*', cells):
                row["cell"] = cell
                row["emotion"] = record["boundary_data_set"][0]["data"]["emotions"]
                row["comment"] = record["boundary_data_set"][0]["data"]["comment"]
                output.append(row)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="one.csv"'

        writer = csv.writer(response)
        writer.writerow(['cell', 'emotion', 'comment'])

        for x in output:
            te = [x['cell'], x['emotion'], x['comment']]
            writer.writerow(te)

        return response






def add_records_to_db(request):

    if request.method == 'POST':
        boundary = ""
        gridList = json.loads(request.POST.get('grids', None))
        commentText = request.POST.get('comment', None)
        emotionsList = json.loads(request.POST.get('emotions', None))
        if not str(commentText).strip():
            commentText = "NA"
        for index in range(len(gridList)):
            boundary = boundary + gridList[index]["id"]

        result = rhealpix_services.addRecordAPIcall(boundary, commentText, emotionsList)

    return HttpResponse(result.text)

