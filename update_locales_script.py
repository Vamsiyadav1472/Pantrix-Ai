import os
import json

d = 'frontend/locales'
for f in os.listdir(d):
    if f.endswith('.json'):
        path = os.path.join(d, f)
        with open(path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
        updated = False
        for k, v in data.items():
            if isinstance(v, str):
                orig_v = v
                v = v.replace('how to make biriyani', 'a recipe')
                v = v.replace('biriyani, ', '')
                v = v.replace(', biriyani', '')
                v = v.replace(': biriyani...', '...')
                if v != orig_v:
                    data[k] = v
                    updated = True
                    
        if updated:
            with open(path, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=4, ensure_ascii=False)
                
print("Updated all locale files")
