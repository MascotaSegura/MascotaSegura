$ProgressPreference = 'SilentlyContinue'
$release = Invoke-RestMethod -Uri 'https://api.github.com/repos/supabase/cli/releases/latest'
$asset = $release.assets | Where-Object { $_.name -match 'windows_amd64.zip$' }
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile 'supabase.zip'
Expand-Archive -Path 'supabase.zip' -DestinationPath 'supabase_cli' -Force
