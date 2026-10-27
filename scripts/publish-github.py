"""Publish only this project's source. Uses Git Credential Manager without logging credentials."""
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

OWNER = 'ahsan-h-shihab'
NAME = 'stateshift-nebius-2026'
environment = dict(os.environ, GCM_INTERACTIVE='Never', GIT_TERMINAL_PROMPT='0')
token = os.environ.get('GITHUB_TOKEN')
if not token:
    try:
        result = subprocess.run(['git', 'credential', 'fill'], input='protocol=https\nhost=github.com\n\n', text=True, capture_output=True, timeout=20, env=environment)
        credential = dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)
        token = credential.get('password')
    except (OSError, subprocess.TimeoutExpired):
        token = None
if not token:
    print('GitHub CLI credential unavailable. No repository was created or pushed.')
    sys.exit(2)

def api(path, method='GET', data=None):
    request = urllib.request.Request('https://api.github.com' + path,
        headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json', 'User-Agent': 'StateShift-publisher'},
        method=method, data=json.dumps(data).encode() if data is not None else None)
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        # Status only: do not log server bodies or credentials.
        return {'http_status': error.code}

account = api('/user')
if account.get('login') != OWNER:
    print('Git credential identity differs from the connected GitHub account, or authentication failed. No changes made.')
    sys.exit(3)
if '--create' not in sys.argv:
    print('Existing GitHub credential is usable for the connected account. No changes made.')
    sys.exit(0)
repository = api('/repos/' + OWNER + '/' + NAME)
if repository.get('http_status') == 404:
    repository = api('/user/repos', 'POST', {'name': NAME, 'description': 'Multilingual agent regression lab: inspect state changes and export executable evidence.', 'private': False, 'auto_init': False})
elif repository.get('id'):
    print('A repository with this name already exists. Refusing to overwrite it; inspect it before pushing.')
    sys.exit(4)
if not repository.get('html_url'):
    print('GitHub repository creation failed; status: ' + str(repository.get('http_status', 'unknown')))
    sys.exit(5)
print(json.dumps({'url': repository['html_url'], 'clone_url': repository['clone_url'], 'private': repository['private']}))
