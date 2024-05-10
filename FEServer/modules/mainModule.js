const express = require('express')
const router = express.Router()
const path = require('path')
const http = require('http')
const fs = require('fs');

router.get('/page', (req, res) => {
    // res.sendFile(path.join(__dirname, 'D:/Acer/Music/share/buki/buki_dc/CollectorAturan/web/web inspect/insideADGC.html'));
    // stream index.html with all connected css and js on folder pages
    // var expressStatic = express.static(path.join(__dirname, 'pages'));
    // expressStatic(req, res, function () {
    //     res.status(404).send('Not found');
    // });



    console.log('masuk');
    // res.send('masuk');
})

router.get('/page2', (req, res) => {
    // app.use(express.static(path.join(__dirname, 'page2')));
    console.log('masuk');
    res.send('masuk2');
})

// +=================+
// | Login Auth API  |
// +=================+

// router.get('/login', (req, res) => {
//     username = req.query.username
//     password = req.query.password
//     console.log(username, password)

//     if (username == 'admin' && password == 'admin') {
//         data = {
//             "status": "success",
//         }
//         res.status(200).send({
//             "status": "success",
//             "token": "123"
//         })
//     }
//     else {
//         data = {
//             "status": "failed",
//         }
//         res.status(401).send({
//             "status": "failed",
//         })
//     }
// }
// )

router.get('/login', (req, res) => {
    const { username, password } = req.query;
    console.log('Received login request:', username, password);

    if (username === 'admin' && password === 'admin') {
        res.status(200).json({ status: 'success' });
    } else {
        res.status(401).json({ status: 'failed' });
    }
});


router.get('/image', (req, res) => {
    const { imagePath } = req.query;
    console.log('Received image request:', imagePath);

    const parentDir = path.join(__dirname, '..');
    const imageFullPath = path.join(parentDir, imagePath);

    if (fs.existsSync(imageFullPath)) {
        res
            .status(200)
            .sendFile(imageFullPath);
    }
    else {
        res
            .status(404)
            .send('Image not found');
    }
});


router.get('/newCard',  async (req, res) => {
    try{
        const parentDir = path.join(__dirname, '..');
        const assetsPath = path.join(parentDir, 'assets', 'newData');
        console.log('Reading new cards from:', assetsPath);
    
        const folders = fs.readdirSync(assetsPath);

        // var folders = [];
        // fs.readdir(assetsPath, (err, files) => { 
        //     if (err) {
        //         console.log('error', err)
        //     } else {
        //         files.forEach(file => {
        //             folders.push(file);
        //         });
        //     }
        // });
    
        let items = [];

        for (let i = 0; i < folders.length; i++) {
            const folderName = folders[i];
            const folderPath = path.join(assetsPath, folderName);
    
            const files =  fs.readdirSync(folderPath);
    
            const jsonFile = files.find(file => file.endsWith('.json'));
            if (jsonFile) {
            const jsonFilePath = path.join(folderPath, jsonFile);
    
            const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
            const { name, description, longDescription, genres } = JSON.parse(jsonData)[0];
            const imageName = folderName + '.jpg';
            const imageUrl = `/assets/newData/${folderName}/${imageName}`;

            // detail image in Detail folder
            const detailPath = path.join(folderPath, 'Detail');
            const detailFiles = fs.readdirSync(detailPath);

            let detailImageUrlList = [];
            for (let j = 0; j < detailFiles.length; j++) {
                const detailFile = detailFiles[j];
                // ends with .jpg or .png
                if (detailFile.endsWith('.jpg') || detailFile.endsWith('.png')) {
                    const detailImagePath = path.join(detailPath, detailFile);
                    const detailImageUrl = `/assets/newData/${folderName}/Detail/${detailFile}`;
                    detailImageUrlList.push(detailImageUrl);
                }
            }

    
            items.push({ title: name, description, imageUrl, longDescription, genres, detailImageUrlList });
            }
        }
        console.log( items);
        res.status(200).json(items );
    }
    catch (error) {
        console.error('Error while reading new cards:', error);
        res.status(500).json({ status: 'failed' });
    }
});


// Recursive function to move a folder and its contents
async function moveFolderRecursive(source, destination) {
    const files = await fs.promises.readdir(source);

    for (const file of files) {
        const sourcePath = path.join(source, file);
        const destPath = path.join(destination, file);

        const fileStats = await fs.promises.stat(sourcePath);

        if (fileStats.isDirectory()) {
            // If it's a directory, recursively move its contents
            await fs.promises.mkdir(destPath, { recursive: true });
            await moveFolderRecursive(sourcePath, destPath);
        } else {
            // If it's a file, move the file
            await fs.promises.copyFile(sourcePath, destPath);
            await fs.promises.unlink(sourcePath); // Remove the original file
        }
    }

    // After moving all contents, remove the source directory
    await fs.promises.rmdir(source);
}



router.post('/wanted', (req, res) => {
    const { item } = req.body;
    console.log('Received wanted item:', item);

    // move folder that contain image name {item} to wanted folder
    const parentDir = path.join(__dirname, '..');
    const assetsPath = path.join(parentDir, 'assets', 'newData');
    const wantedPath = path.join(parentDir, 'assets', 'wantedList');

    const folderPath = path.join(assetsPath, item);
    const wantedFolderPath = path.join(wantedPath, item);

    moveFolderRecursive(folderPath, wantedFolderPath)
        .then(() => {
            res.status(200).json({ status: 'success' });
        })
        .catch((error) => {
            console.error('Error while moving folder:', error);
            res.status(500).json({ status: 'failed' });
        });



    // move folder that contain image name {item} to wanted folder
    // const parentDir = path.join(__dirname, '..');
    // const assetsPath = path.join(parentDir, 'assets', 'newData');
    // const wantedPath = path.join(parentDir, 'assets', 'wantedList');

    // const folderPath = path.join(assetsPath, item);
    // const wantedFolderPath = path.join(wantedPath, item);

    // fs.rename(folderPath, wantedFolderPath, (err) => {
    //     if (err) {
    //         console.error('Error while moving folder:', err);
    //         res.status(500).json({ status: 'failed' });
    //     }
    //     else {
    //         res.status(200).json({ status: 'success' });
    //     }
    // });

    // make a same folder in wanted folder
    
}
);
router.post('/wasted', (req, res) => {
    const { item } = req.body;
    console.log('Received wasted item:', item);

    // move folder that contain image name {item} to wasted folder
    const parentDir = path.join(__dirname, '..');
    const assetsPath = path.join(parentDir, 'assets', 'newData');
    const wastedPath = path.join(parentDir, 'assets', 'wastedList');

    const folderPath = path.join(assetsPath, item);
    const wastedFolderPath = path.join(wastedPath, item);

    moveFolderRecursive(folderPath, wastedFolderPath)
        .then(() => {
            res.status(200).json({ status: 'success' });
        })
        .catch((error) => {
            console.error('Error while moving folder:', error);
            res.status(500).json({ status: 'failed' });
        });

    // fs.rename(folderPath, wastedFolderPath, (err) => {
    //     if (err) {
    //         console.error('Error while moving folder:', err);
    //         res.status(500).json({ status: 'failed' });
    //     }
    //     else {
    //         res.status(200).json({ status: 'success' });
    //     }
    // });
});

        // const folder =  fs.readdir(assetsPath);


        // const items = {};

        // for (let i = 0; i < folder.length; i++) {
        //     const folderName = folder[i];
        //     const folderPath = path.join(assetsPath, folderName);

        //     const files =  fs.readdir(folderPath);

        //     const jsonFile = files.find(file => file.endsWith('.json'));
        //     if (jsonFile) {
        //         const jsonFilePath = path.join(folderPath, jsonFile);
        //         const jsonData =  fs.readFile(jsonFilePath, 'utf8');
        //         const { name, description } = JSON.parse(jsonData);

        //         const imageName = folderName + '.jpg';
        //         const imageUrl = `/assets/newData/${folderName}/${imageName}`;

        //         items[`item${i + 1}`] = { title : name, description : description, imageUrl : imageUrl };
        //     }
        // }

//         res.status(200).json({ items });
//     }
//     catch (error) {
//         console.error('Error while reading new cards:', error);
//         res.status(500).json({ status: 'failed' });
//     }
// });




// router.post('/wanted', (req, res) => {
//     const { item } = req.body;
//     console.log('Received wanted item:', item);

//     fs.appendFile('wanted.txt', item + '\n', (err) => {
//         if (err) {
//             console.error('Error while writing wanted item:', err);
//             res.status(500).json({ status: 'failed' });
//         } else {
//             res.status(200).json({ status: 'success' });
//         }
//     }
//     );
// }
// );

// router.get('/wanted', (req, res) => {   
//     try {
//         fs.readFile('wanted.txt', 'utf8', (err, data) => {
//             if (err) {
//                 console.error('Error while reading wanted items:', err);
//                 res.status(500).json({ status: 'failed' });
//             } else {
//                 res.status(200).json({ items: data.split('\n') });
//             }
//         });
//     } catch (error) {
//         console.log('error', error)
//     }
// }
// );

// router.post('/wasted', (req, res) => {
//     const { item } = req.body;
//     console.log('Received wasted item:', item);

//     fs.appendFile('wasted.txt', item + '\n', (err) => {
//         if (err) {
//             console.error('Error while writing wasted item:', err);
//             res.status(500).json({ status: 'failed' });
//         } else {
//             res.status(200).json({ status: 'success' });
//         }
//     }
//     );
// }
// );	

// router.get('/wasted', (req, res) => {
//     fs.readFile('wasted.txt', 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error while reading wasted items:', err);
//             res.status(500).json({ status: 'failed' });
//         } else {
//             res.status(200).json({ items: data.split('\n') });
//         }
//     });
// }
// );




module.exports = router