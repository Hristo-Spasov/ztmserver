const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", `Key 76d9f0ea2bf64630b23f756b4f0b84cc`);

const handleApiCall = (req,res) => {
    stub.PostModelOutputs(
        {
            model_id: "face-detection",
            inputs: [{data: {image: {url: req.body.input}}}]
        },
        metadata,
        (err, response) => {
            if (err) {
                console.log("Error: " + err);
                return;
            }

            if (response.status.code !== 10000) {
                console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
                return;
            }

            console.log("Predicted concepts, with confidence values:")
            for (const c of response.outputs[0].data.concepts) {
                console.log(c.name + ": " + c.value);
            }
            res.json(response)
        }
    );
}

const handleImageScore = (req,res,db) => {
    const { id } = req.body;
    db('users')
    .where('id', '=', id)
    .increment('score',1)
    .returning('score')
    .then(score => {
        res.json(score[0].score);
    })
    .catch(err => res.status(400))
}

module.exports = {
    handleImageScore:handleImageScore,
    handleApiCall:handleApiCall
}