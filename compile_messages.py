"""
Simple .po to .mo converter for Django translations
"""
import os
import struct

def make_mo_file(po_path, mo_path):
    """Convert .po file to .mo file."""
    
    # Read .po file and extract translations
    translations = {}
    
    with open(po_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple parser for .po files
    lines = content.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if line.startswith('msgid '):
            # Extract msgid
            msgid = line[6:].strip('"')
            
            # Handle multi-line msgid
            i += 1
            while i < len(lines) and lines[i].strip().startswith('"'):
                msgid += lines[i].strip().strip('"')
                i += 1
            
            # Look for msgstr
            if i < len(lines) and lines[i].strip().startswith('msgstr '):
                msgstr = lines[i].strip()[7:].strip('"')
                
                # Handle multi-line msgstr
                i += 1
                while i < len(lines) and lines[i].strip().startswith('"'):
                    msgstr += lines[i].strip().strip('"')
                    i += 1
                
                if msgid and msgstr:
                    translations[msgid] = msgstr
            else:
                i += 1
        else:
            i += 1
    
    # Remove empty translations
    translations = {k: v for k, v in translations.items() if k and v}
    
    # Create .mo file
    keys = sorted(translations.keys())
    
    # Calculate offsets
    kencoded = []
    vencoded = []
    
    for k in keys:
        kencoded.append(k.encode('utf-8'))
        vencoded.append(translations[k].encode('utf-8'))
    
    keystart = 7 * 4 + 16 * len(keys)
    valuestart = keystart
    for k in kencoded:
        valuestart += len(k)
    
    koffsets_start = 7 * 4
    voffsets_start = koffsets_start + 4 * len(keys)
    
    # Write .mo file
    with open(mo_path, 'wb') as f:
        # Magic number
        f.write(struct.pack('<L', 0x950412DE))
        # Version
        f.write(struct.pack('<L', 0))
        # Number of entries
        f.write(struct.pack('<L', len(keys)))
        # Offset of key table
        f.write(struct.pack('<L', koffsets_start))
        # Offset of value table  
        f.write(struct.pack('<L', voffsets_start))
        # Size of hash table
        f.write(struct.pack('<L', 0))
        # Offset of hash table
        f.write(struct.pack('<L', 0))
        
        # Key offsets and lengths
        offset = keystart
        for k in kencoded:
            f.write(struct.pack('<L', len(k)))
            f.write(struct.pack('<L', offset))
            offset += len(k)
            
        # Value offsets and lengths  
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

if __name__ == "__main__":
    # Convert English
    make_mo_file(
        "locale/en/LC_MESSAGES/django.po", 
        "locale/en/LC_MESSAGES/django.mo"
    )
    
    # Convert Russian
    make_mo_file(
        "locale/ru/LC_MESSAGES/django.po", 
        "locale/ru/LC_MESSAGES/django.mo"
    )
    
    print("Successfully created .mo files")