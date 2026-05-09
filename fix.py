import os
import glob
import re

replacements = {
    'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú', 'Ã±': 'ñ',
    'Ã\x81': 'Á', 'Ã\x89': 'É', 'Ã\x8d': 'Í', 'Ã\x93': 'Ó', 'Ã\x9a': 'Ú', 'Ã\x91': 'Ñ',
    'Â¿': '¿', 'Â¡': '¡', 'Ã¼': 'ü', 'mǭs': 'más', 'Ǹ': 'é', 'cdigo': 'código',
    'podrǭ': 'podrá', 'informacin': 'información', 'mǸdicos': 'médicos',
    'Cmo': '¿Cómo', 'bǭsicos': 'básicos', 'Prez': 'Pérez', 'contrasea': 'contraseña'
}

def fix_text(content):
    for bad, good in replacements.items():
        content = content.replace(bad, good)
    return content

files = glob.glob('*.html') + glob.glob('*.js')
for filepath in files:
    if filepath == 'fix.py': continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = fix_text(content)
    
    if filepath == 'script.js':
        # Fix SW registration
        content = content.replace("await navigator.serviceWorker.register('./sw.js');", 
                                  "if (location.protocol === 'file:') return;\n            await navigator.serviceWorker.register('./sw.js');")
        content = content.replace("navigator.serviceWorker.register('./sw.js').catch(() => {});",
                                  "if (location.protocol !== 'file:') {\n                navigator.serviceWorker.register('./sw.js').catch(() => {});\n            }")
        
        # Fix Modal UI
        content = content.replace("rounded-[2rem]", "rounded-lg")
        content = content.replace("rounded-[2.5rem]", "rounded-lg")
        content = content.replace("rounded-3xl", "rounded-lg")
        content = content.replace("rounded-2xl", "rounded-lg")
        content = content.replace("rounded-xl", "rounded-lg")
        content = content.replace("rounded-full", "rounded-lg")
        
        # Fix Icon Logic
        content = content.replace("config.icon || 'ph-check-circle'", "config.icon || (config.isError ? 'ph-warning-circle' : 'ph-check-circle')")
        
        # Fix Button Color to unified brand
        content = re.sub(r"\$\{config\.isError \? 'bg-red-500 hover:bg-red-600' : 'bg-brand hover:bg-brandHover'\}", "bg-brand hover:bg-brandHover", content)
        content = content.replace("bg-red-500 hover:bg-red-600", "bg-brand hover:bg-brandHover")
        
        # Remove any stray shadows
        content = content.replace("shadow-none", "")
        content = content.replace("shadow-md", "")
        content = content.replace("shadow-lg", "")
        content = content.replace("shadow-sm", "")
    
    # Save back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixes applied.")
