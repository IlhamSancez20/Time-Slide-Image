const FOLDER_ID = '1hUmqHwJuN4yW1_UyfRyRnuevpCpIbPWd';
const SHEET_NAME = 'GalleryData';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['ID_Gambar', 'Nama_File', 'URL_Google_Drive', 'URL_Direct_Image', 'Tanggal_Upload']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
  }
  return sheet;
}

function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();
    const data = [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        data.push({
          id: String(rows[i][0]),
          fileName: String(rows[i][1]),
          driveUrl: String(rows[i][2]),
          directUrl: String(rows[i][3]),
          uploadDate: String(rows[i][4])
        });
      }
    }
    return responseJSON({ status: 'success', data: data });
  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Data POST kosong');
    }
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;

    if (action === 'upload') {
      return handleUpload(contents);
    } else if (action === 'delete') {
      return handleDelete(contents);
    } else {
      return responseJSON({ status: 'error', message: 'Aksi tidak valid' });
    }
  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  }
}

function handleUpload(payload) {
  const { fileName, mimeType, base64Data } = payload;
  
  if (!base64Data || !fileName) {
    throw new Error('Data file tidak lengkap.');
  }

  const rawBase64 = base64Data.split(',')[1] || base64Data;
  const bytes = Utilities.base64Decode(rawBase64);

  if (bytes.length > 512000) {
    throw new Error('Ukuran file melebihi batas 500 KB.');
  }

  const blob = Utilities.newBlob(bytes, mimeType || 'image/jpeg', fileName);
  
  let folder;
  try {
    folder = DriveApp.getFolderById(FOLDER_ID);
  } catch (e) {
    throw new Error('Folder Google Drive tidak ditemukan atau ID Folder salah: ' + e.message);
  }

  const file = folder.createFile(blob);
  
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    console.warn('Izin berbagi gagal disetel secara otomatis:', e);
  }

  const fileId = file.getId();
  const driveUrl = file.getUrl();
  const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
  
  const idGambar = 'IMG_' + new Date().getTime();
  const tanggalUpload = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

  const sheet = getOrCreateSheet();
  sheet.appendRow([idGambar, fileName, driveUrl, directUrl, tanggalUpload]);

  return responseJSON({
    status: 'success',
    data: {
      id: idGambar,
      fileName: fileName,
      driveUrl: driveUrl,
      directUrl: directUrl,
      uploadDate: tanggalUpload
    }
  });
}

function handleDelete(payload) {
  const idGambar = payload.id;
  if (!idGambar) throw new Error('ID Gambar dibutuhkan.');

  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  let fileIdToDelete = null;
  let rowIndexToDelete = -1;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(idGambar)) {
      rowIndexToDelete = i + 1;
      const directUrl = String(rows[i][3]);
      const match = directUrl.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) fileIdToDelete = match[1];
      break;
    }
  }

  if (rowIndexToDelete === -1) {
    throw new Error('Gambar tidak ditemukan.');
  }

  if (fileIdToDelete) {
    try {
      DriveApp.getFileById(fileIdToDelete).setTrashed(true);
    } catch (e) {
      console.warn('File di Drive tidak ditemukan atau sudah terhapus:', e);
    }
  }

  sheet.deleteRow(rowIndexToDelete);
  return responseJSON({ status: 'success', message: 'Gambar berhasil dihapus' });
}

function responseJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}