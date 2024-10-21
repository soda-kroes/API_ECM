const KEY_TOKEN = "kjsdflksjdfSDFSFSfjskdfjs#$%#%@jkdfaskjfksahfjahfkhhahsfs076865657567";
const REFRESH_KEY = "skjdflskhdfieh48758345kdsjbfsh@#$#%!@#$#Hkflksdhf3847589376y@#$!#DSFDSAFewhkfjasyt47592";

const isEmptyOrNull = (value) => {
    if(value === "" || value === null || value === undefined){
        return true;
    }
    return false;
};

const invoiceNumber = (number) => {
    var str = ""+(number+1);
    var pad = "0000";
    var invoice = pad.substring(0,pad.length - str.length) + str;
    console.log(invoice)
    return "INV"+invoice; //INV0001, INV0002, INV19999
}

module.exports = { isEmptyOrNull,invoiceNumber ,KEY_TOKEN,REFRESH_KEY};