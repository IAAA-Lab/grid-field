# DGGS Grid Field

An app to collect georeferenced data in the field based on a Discrete Global Grid. Is is being created in python 3.8.1 using Django framework.

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install dependencies from the requirements.txt file. It is recommended to create a separate Python3 virtual environment first to avoid complexities and dependencies issues.   

```bash
pip install -r requirements.txt
```

## Configuration & Usage

In file dggs/dggs/settings.py, there are configuration setting of the application. In the DATABASE section, DB connection settings needs to be defined. e.g. as below (In case of PostgreSQL at localhost and port 5430)

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'database_name',
        'USER': 'db_user',
        'PASSWORD': 'password',
        'HOST': '127.0.0.1',
        'PORT': '5432'
    }
}
```

Once configurations are done, application can be run simply by using executing the dggs/manage.py by python as below. By default, application can be accessible at  http://127.0.0.1:8000/ 
```python
python manage.py runserver
```


## License
--