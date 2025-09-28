import DataUriParser from "datauri/parser.js";
import path from "path";

const parser=new DataUriParser();
const getDataUri=(file)=>{
    const extName=path.extname(file.originalname).toString();
    const result = parser.format(extName,file.buffer);
    console.log('DataURI result:', result ? 'Generated successfully' : 'Failed to generate');
    return result.content;
};
export default getDataUri;