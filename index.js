import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

async function distance(lat1, lat2, lon1, lon2) {

    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers is 6371. 
    let r = 6371;

    // calculate the result
    return (c * r);
};

async function sort(arr) {

    async function swap(arr, i, j) {
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    async function partition(arr, pivot, left, right) {
        var pivotValue = arr[pivot].distance,
            partitionIndex = left;

        for (var i = left; i < right; i++) {
            if (arr[i].distance < pivotValue) {
                swap(arr, i, partitionIndex);
                partitionIndex++;
            }
        }
        await swap(arr, right, partitionIndex);
        return partitionIndex;
    }
    async function quickSort(arr, left, right) {
        var len = arr.length,
            pivot,
            partitionIndex;


        if (left < right) {
            pivot = right;
            partitionIndex = await partition(arr, pivot, left, right);

            //sort left and right
            await quickSort(arr, left, partitionIndex - 1);
            await quickSort(arr, partitionIndex + 1, right);
        }
        return arr;
    }
    const result = await quickSort(arr, 0, arr.length - 1);
    return result;
}

async function getPlaces() {
    let places = [];
    await fetch('https://apitest2.smartsevak.com/places')
        .then(res => res.json())
        .then(data => {
            places = [...data.data];
        });
    return [...places];

}


async function run() {
    try {

        // =========================================================================== 
        // this end point is to get places sorted by distance.  use this url
        //   "http://localhost:5000/get-sorted-places?lat=26.94032431&lng=75.80139381" 
        //                     for sample testing
        // ========================================================================== 
        app.get('/get-sorted-places', async (req, res) => {
            const arr = [1, 2];
            console.log(arr.length - 1);
            const { lat, lng } = req.query;
            const data = await getPlaces();
            for (let place of data) {
                const dist = await distance(lat, place.lat, lng, place.lng);
                place.distance = dist;
            };
            const sortedArray = await sort(data);
            res.json(data);
        });
    }
    finally {

    }
}

run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('use /get-sorted-places  for testing.');
})

app.listen(port, () => {
    console.log('\n-------------------------app running--------------------------\n')
})
