import git
import os
import shutil
import json
import time

basedir = os.path.join('.','data')
repodir = os.path.join(basedir, 'repository')
gitrepo = None


def setup_up_version_repo():
    try:
        shutil.rmtree(repodir)
    except FileNotFoundError as e:
        print(f'The repo directory does not exist. It is fine.')
    global gitrepo
    gitrepo = git.Repo.init(repodir)



def save_record_to_git(record, id):
    with open(os.path.join(repodir, id+'.json') , 'w', encoding='utf-8') as f:
        json.dump(record, f, ensure_ascii=False, indent=4)
        timestr = time.strftime("%Y%m%d-%H%M%S")
        gitrepo.index.add('*')
        gitrepo.index.commit(id+"-"+timestr)
        gitrepo.create_tag(id+"-"+timestr)
