"""Simple .po to .mo converter"""
import struct

def convert_po_to_mo(po_path, mo_path):
    translations = {}
    
    with open(po_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse .po file
    import re
    msgid_pattern = r'msgid\s+"([^"]*)"'
    msgstr_pattern = r'msgstr\s+"([^"]*)"'
    
    msgids = re.findall(msgid_pattern, content)
    msgstrs = re.findall(msgstr_pattern, content)
    
    for msgid, msgstr in zip(msgids, msgstrs):
        if msgid and msgstr:
            translations[msgid] = msgstr
    
    # Create .mo file
    keys = sorted(translations.keys())
    kencoded = [k.encode('utf-8') for k in keys]
    vencoded = [translations[k].encode('utf-8') for k in keys]
    
    keystart = 7 * 4 + 16 * len(keys)
    valuestart = keystart + sum(len(k) for k in kencoded)
    
    with open(mo_path, 'wb') as f:
        # Header
        f.write(struct.pack('<L', 0x950412DE))  # Magic
        f.write(struct.pack('<L', 0))           # Version
        f.write(struct.pack('<L', len(keys)))   # Number of entries
        f.write(struct.pack('<L', 7 * 4))       # Key table offset
        f.write(struct.pack('<L', 7 * 4 + 4 * len(keys)))  # Value table offset
        f.write(struct.pack('<L', 0))           # Hash table size
        f.write(struct.pack('<L', 0))           # Hash table offset
        
        # Key table
        offset = keystart
        for k in kencoded:
            f.write(struct.pack('<L', len(k)))
            f.write(struct.pack('<L', offset))
            offset += len(k)
        
        # Value table
        offset = valuestart
        for v in vencoded:
            f.write(struct.pack('<L', len(v)))
            f.write(struct.pack('<L', offset))
            offset += len(v)
        
        # Keys
        for k in kencoded:
            f.write(k)
        
        # Values
        for v in vencoded:
            f.write(v)

# Convert files
convert_po_to_mo("locale/en/LC_MESSAGES/django.po", "locale/en/LC_MESSAGES/django.mo")
convert_po_to_mo("locale/ru/LC_MESSAGES/django.po", "locale/ru/LC_MESSAGES/django.mo")
print("Successfully created .mo files")