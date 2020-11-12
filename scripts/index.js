const geojsonGenerator = require('./csvToGeojson');
const { LAYER_TYPE } = require('./common');
const layer = process.argv[2].toLocaleLowerCase(); 

function checkInput() {
    const isValidInput = [LAYER_TYPE.CONFIRMED,LAYER_TYPE.DEATHS,LAYER_TYPE.RECOVERED, LAYER_TYPE.DAILY];
    if (isValidInput.indexOf(layer) < 0) throw "Parameter must be either confiremd, deaths, recovered or daily";
}

function handleError(error) {
    console.error(error);
    process.exit(1);
}

async function run() {
    try {
        checkInput()
        console.log('----------')
        console.log(`Starting to generate geojson for ${layer} `)
        console.log('----------')
        geojsonGenerator.generate(layer)
    } catch(e) {
        handleError(e)
    }    
}

run()