import urllib.request
import json
import zipfile
import os

req = urllib.request.Request('https://api.github.com/repos/supabase/cli/releases/latest', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    url = next(asset['browser_download_url'] for asset in data['assets'] if asset['name'].endswith('windows_amd64.zip'))

print("Downloading:", url)
urllib.request.urlretrieve(url, 'supabase.zip')
print("Downloaded. Extracting...")
with zipfile.ZipFile('supabase.zip', 'r') as zip_ref:
    zip_ref.extractall('supabase_cli')
print("Done!")
