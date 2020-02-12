const express = require("express");
const app = express();
const PORT = 8080 || process.env.PORT;
const axios = require("axios");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let apiData = [];

const returnData = (res, data) => {
    res.json({
        length: data.length,
        data
    })
}

app.get("/", (req, res) => {
    axios.get("https://fhir-open.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/Condition?patient=1316024&status=active")
        .then(data => {
            apiData = data.data;
            res.json(data.data)
        }).catch(err => res.send(err));
});

const filter = (req, res) => {
    const {
        filters,
        resourceText
    } = req.body;
    let finalFilteredItems = {...apiData};
    if(filters.includes("resolved")){
        finalFilteredItems.entry = finalFilteredItems.entry.filter(d => d.resource.clinicalStatus === "resolved")
    }
    if(filters.includes("active")){
        finalFilteredItems.entry = finalFilteredItems.entry.filter(d => d.resource.clinicalStatus === "active")
    }
    if(filters.includes("confirmed")){
        finalFilteredItems.entry = finalFilteredItems.entry.filter(d => d.resource.verificationStatus !== "confirmed")
    }
    if(filters.includes("differential")){
        finalFilteredItems.entry = finalFilteredItems.entry.filter(d => d.resource.verificationStatus !== "differential")
    }
    if(filters.includes("resource")){
        finalFilteredItems.entry = finalFilteredItems.entry.filter(d => d.resource.code.text === resourceText)
    }
    returnData(res, finalFilteredItems.entry)
}

app.get("/filter", (req, res) => filter(req, res));

app.listen(PORT, console.log(`server listening on port ${PORT}`));

// filters
// clinicalStatus: resolved, active
// dateRecorded
// verificationStatus: confirmed, differential
// resource