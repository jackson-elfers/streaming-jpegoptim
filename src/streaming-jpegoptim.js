const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const uuidv1 = require("uuid/v1");
const filetype = require("file-type");

module.exports = function(props) {
  // public

  // private
  props.compressorPath =
    props.compressorPath == undefined
      ? path.join(__dirname, "./images/")
      : props.compressorPath;
  const config = props;
  const state = {
    uncompressedPath: path.join(config.compressorPath, "./uncompressed/"),
    compressedPath: path.join(config.compressorPath, "./compressed/")
  };

  function mkdir(dirpath) {
    // make directory by path
    return new Promise((resolve, reject) => {
      if (fs.existsSync(dirpath)) {
        resolve();
      } else {
        fs.mkdir(dirpath, error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      }
    });
  }

  function promisePipe(readStream, writeStream) {
    // pipe wrapped inside a promise
    return new Promise((resolve, reject) => {
      readStream
        .pipe(writeStream)
        .on("finish", () => {
          resolve();
        })
        .on("error", error => {
          reject(error);
        });
    });
  }

  function jpegoptim(inputFilepath, outputFilepath) {
    // call jpegoptim to compress
    return new Promise((resolve, reject) => {
      const cmd = spawn("jpegoptim", [
        "--size=" + config.targetSize,
        inputFilepath,
        "--dest=" + state.compressedPath
      ]);

      cmd.stderr.on("data", data => {
        reject(new Error(data.toString()));
      });

      cmd.on("close", data => {
        resolve();
      });
    });
  }

  function createReadStream(filepath) {
    // returns readstream that removes compressed file after event end
    return fs.createReadStream(filepath).on("end", () => {
      fs.unlinkSync(filepath);
    });
  }

  // privileged
  this.compress = async function(readStream) {
    await mkdir(config.compressorPath);
    await mkdir(state.uncompressedPath);
    await mkdir(state.compressedPath);
    const typedReadStream = await filetype.stream(readStream);
    const filename = uuidv1() + "." + typedReadStream.fileType.ext;
    const uncompressedFilepath = path.join(state.uncompressedPath, filename);
    const compressedFilepath = path.join(state.compressedPath, filename);
    await promisePipe(
      typedReadStream,
      fs.createWriteStream(uncompressedFilepath)
    );
    await jpegoptim(uncompressedFilepath);
    fs.unlinkSync(uncompressedFilepath);
    return createReadStream(compressedFilepath);
  };
};
