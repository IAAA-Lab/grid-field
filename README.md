# DGGS Grid Field

An app to collect georeferenced data in the field based on a Discrete Global Grid. It is being created in Python 3.8.1 using Django framework.

## Python libraries

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install dependencies from the requirements.txt file. It is recommended to create a separate Python3 virtual environment first to avoid complexities and dependencies issues. 

For example, tested in Ubuntu 18.04:

- Create a virtual environment: `python3 -m venv ./venv/grid-field-env`. You may need to install the `python3-venv` package. Make sure to create your environment inside of a venv or env directory, like shown, so git will ignore it.
- Activate the virtual environment: `source ./venv/grid-field-env/bin/activate`.
- Install the requirements in your virtual environment: `pip install -r requirements.txt`. You may need to install the `libpq-dev` package in your system.

## Install, start and stop PostgreSQL/PostGIS

The GitHub repository includes a docker-compose.yml file that references a docker image with PostgreSQL/PostGIS (kartoza/postgis) and a volume for the database data, so the changes in the database are not lost when you start and stop the Docker container.

Install [Docker Compose](https://docs.docker.com/compose/) in your computer. After that, you just need to run `docker-compose up` in the same directory as the docker-compose.yml file. This will download the kartoza/postgis Docker image, only the first time, will create the volume, again only the first time, and will start the Docker container with PostGIS.

To stop the docker container, and remove it and the network, just run `docker-compose down`. This does not remove the volume, so the data in the database will not be lost; this is what you normally want. If you run `docker-compose down --volumes` then you will remove the volume, so the data in the database will be lost and you will have to restore the backup again as shown above for everything to work.

## Populate de database
To have the database scheme and the data required for the application, you need to restore a backup of the database (only the first time, or after you delete the volume that the docker-compose.yml file references). 

The backup is in .data/dggsgrids file. You may use PgAdmin 4 for this: connect to the database in Docker, right click on Databases > postgres, Restore... and in the dialog select Format Custom or tar, Filename the one extracted from the zip file (you will need to select "All Files" in Format to see it), leave Number of jobs empty and in Role name selecte postgres. Then click "Restore". It may give you an error, but the restore should be done. If you prefer the command line, from the root directory of your clone of the repository:

`/usr/bin/pg_restore --host "localhost" --port "25432" --username "docker" --no-password --role "postgres" --dbname "postgres" --verbose .data/dggsgrids`


## Configuration & Usage

In the file dggs/dggs/settings.py, there are configuration setting of the application. In the DATABASE section, DB connection settings are configured. By default, they point out to the database started by docker-compose and it should not be necessary to change it:


```python
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'postgres',
        'USER': 'docker',
        'PASSWORD': 'docker',
        'HOST': 'localhost',
        'PORT': '25432'
    }
}
```

The application can be run simply by using executing the dggs/manage.py with Python as shown below. By default, the application will be accessible at <http://127.0.0.1:8000/>.

```python
python manage.py runserver
```


## License
Licensor: [Advanced Information Systems Laboratory, Aragon Institute for Engineering Research, Universidad Zaragoza, Spain](https://www.iaaa.es).
[European Union Public License v1.2](https://eupl.eu/1.2/en/).
