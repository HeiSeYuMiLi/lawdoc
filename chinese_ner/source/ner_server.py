import os
import re

from fastapi import FastAPI
from pydantic import BaseModel

from ner_predict import get_entities_result

class Item(BaseModel):
    text: str

app = FastAPI()

clue_path = os.path.join(os.path.abspath('..'), 'output/20240515081033')

def find_element(arr):
    for i in range(1, len(arr)):
        if arr[i] > 100:
            diff = arr[i] - arr[i-1]
            if diff > arr[i-1]:
                return arr[i]
            else:
                return arr[i-1]
    return -1

def split_string(s):
    # 查找所有逗号和句号的位置
    positions = [match.start() for match in re.finditer(r'[，。]', s)]
    if len(positions) == 1:
        return s, ''
    index = find_element(positions)
    if index == -1:
        return s, ''
    return s[:index + 1], s[index + 1:]

def add_len(len, list):
    for j in list:
        j['begin'] += len
        j['end'] += len
    return list

def merge_label(labels):
    res = {}
    for j in labels:
        label = j['value']
        if label not in res:
            res[label] = {}
            res[label]['pos'] = []
        res[label]['type'] = j['type']
        res[label]['pos'].append({int(j['begin']),int(j['end'])})
    return res

def merge_type_label(json):
    res = {}
    for j in json:
        type = json[j]["type"]
        if type not in res:
            res[type] = []
        p = {}
        p[j] = json[j]["pos"]
        res[type].append(p)
    return res

@app.post("/ner")
async def read_item(item: Item):
    text = item.text.replace(" ","")

    entities = []
    sentence_len = 0
    total_len = 0
    while True:
        total_len += sentence_len
        text_len = len(text)
        if text_len < 100:
            entities.extend(add_len(total_len, get_entities_result(text, clue_path)))
            break
        text1, text2 = split_string(text)
        text = text2
        sentence_len = len(text1)
        entities.extend(add_len(total_len, get_entities_result(text1, clue_path)))
    
    return entities

# uvicorn ner_server:app --reload