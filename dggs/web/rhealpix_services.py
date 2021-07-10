import requests
import json

def addRecordAPIcall(boundary, commentText, emotionsList):

    url = "http://127.0.0.1:8000/bdatasets/"
    params = {'id': str(generateNewID()),
              'boundary_data_set': [{
                  "boundary": boundary,
                  "data": {
                      "comment": commentText,
                      "emotions": emotionsList
                  }

              }]
              }
    r = requests.post(url, json=params)
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
