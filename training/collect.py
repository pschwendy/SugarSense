# Collects data into one file
# Makes big dictionary to keep sandbox patients separate
import json
import numpy as np

data4 = np.array(json.load(open('data/data4.json')))
data5 = np.array(json.load(open('data/data5.json')))
data6 = np.array(json.load(open('data/data6.json')))

data = {
    'patient4': data4,
    'patient5': data5,
    'patient6': data6,
}

np.save('data/data.npy', data)

print('Done!')