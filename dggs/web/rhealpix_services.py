import requests
import json
from .versioning import gitversioning as versioning

def addRecordAPIcall(boundary, commentText, emotionsList):

    url = "http://127.0.0.1:8000/bdatasets/"
    id = str(generateNewID())
    params = {'id': id,
              'boundary_data_set': [{
                  "boundary": boundary,
                  "data": {
                      "comment": commentText,
                      "emotions": emotionsList
                  }

              }]
              }
    r = requests.post(url, json=params)
    if r.status_code == 201:
        versioning.save_record_to_git(params, id)
    return r


def generateNewID():
    url = "http://127.0.0.1:8000/idsbdatasets/last/"
    r = requests.get(url)
    id = json.loads(r.content)["id"]
    print(id)
    if len(id) == 0:
        id = "id_1"
    else:
        id = id.split('_')[0] + "_" + str(int(id.split('_')[1]) + 1)
    print(id)
    return id