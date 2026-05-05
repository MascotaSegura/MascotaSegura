import os
import glob
import re

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove all firebase script tags
    content = re.sub(r'<script[^>]+firebase-app-compat\.js[^>]*></script>', '', content)
    content = re.sub(r'<script[^>]+firebase-auth-compat\.js[^>]*></script>', '', content)
    content = re.sub(r'<script[^>]+firebase-database-compat\.js[^>]*></script>', '', content)
    
    # Check if supabase is already there
    if '@supabase/supabase-js' not in content:
        if 'script.js' in content:
            content = re.sub(r'(<script[^>]+src="script\.js"[^>]*></script>)', r'<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n    \1', content)
        else:
            content = re.sub(r'</body>', r'<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n</body>', content)

    # clean up empty lines where scripts were
    content = re.sub(r'\n\s*\n\s*\n', '\n', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
