//localstorage.js

class MesiboLocalStorage {

  getActiveUserList() {
    MesiboLog("===>LocalStorage_GetActiveUsers called");
    const activeMsgUsr = localStorage.getItem("Mesibo_MsgUsr_Hash");
    var activeUserList = [];
    MesiboLog("Mesibo_MsgUsr_Hash", activeMsgUsr);
    if (activeMsgUsr) {
      activeUserList = Object.values(JSON.parse(activeMsgUsr));
      activeUserList = activeUserList.filter(onlyUnique);
    }

    MesiboLog(activeUserList);
    return activeUserList;
  }

  getPhoneBook() {
    var localPhoneBook = localStorage.getItem("Mesibo_LocalPhoneBook");
    if (!localPhoneBook)
      localPhoneBook = {};
    else
      localPhoneBook = JSON.parse(localPhoneBook);
    // MesiboLog(localPhoneBook);
    return localPhoneBook;
  }

  getMsgArrayForPeer(pPeerId) {
    var peerMsgArray = localStorage.getItem(pPeerId);
    if (peerMsgArray)
      return JSON.parse(peerMsgArray);
    else
      return [];
  }


  getPeerFromId(msgId) {
    var retrievedMsgHash = localStorage.getItem("Mesibo_MsgUsr_Hash");
    if (retrievedMsgHash)
      retrievedMsgHash = JSON.parse(retrievedMsgHash);
    else {
      MesiboLog("Error: Invalid message ID");
      return -1;
    }

    return retrievedMsgHash[msgId];
  }

  getLastReceived(pPeerId) {
    var jsonMsgArray = this.getMsgArrayForPeer(pPeerId);
    if (jsonMsgArray) {
      for (var i = jsonMsgArray.length - 1; i >= 0; i--) {
        if (jsonMsgArray[i]['origin'] == MESIBO_MSG_ORIGIN_RECIEVED)
          return jsonMsgArray[i]['id'];
      }
    }
    return 0;
  }

  loadHistory(selected_user) {
    MesiboLog("===>LocalStorage_LoadHistory called")

    var msg_history = JSON.parse(localStorage.getItem(selected_user));

    if (msg_history) {
      var msg_hist_data = Object.keys(msg_history).map(function(key) {
        return msg_history[key];
      });

      var previous_date = 0;

      for (var i = 0; i < msg_hist_data.length; i++) {
        var msg_data = msg_hist_data[i];
        previous_date = MesiboUIUtils.createDateHeaderForHistory(msg_data, previous_date);

        if (msg_data['flag'] == 0) {
          if (msg_data['filetype'])
            MesiboUIUtils.createImageSentBubble(msg_data);
          else
            MesiboUIUtils.createSentBubble(msg_data);
        } else {
          if (msg_data['filetype'])
            MesiboUIUtils.createImageRecievedBubble(msg_data);
          else
            MesiboUIUtils.createRecievedBubble(msg_data);
        }
      }

    }
  }

  //m is the message object

  updateItemSent(m) {
    MesiboLog("===>LocalStorage_UpdateItemSent called");
    var retrievedMsgArray = localStorage.getItem(m.peer);
    //MsgList Entry Will always exist if msg sent.No need to check
    var jsonMsgArray = JSON.parse(retrievedMsgArray);
    // MesiboLog(jsonMsgArray);

    var msgIdPos = -1;

    // MesiboLog(jsonMsgArray,m.id);

    for (var i = jsonMsgArray.length - 1; i >= 0; i--) {
      if (jsonMsgArray[i]['id'] == m.id) {
        jsonMsgArray[i]['params'] = m;
        jsonMsgArray[i]['status'] = m.status;
        msgIdPos = i;
        break;
      }
    }

    if (msgIdPos == -1) {
      MesiboLog("Error:localstorage.js:updateItemSent: Message ID not found");
    }

    //If status for this message is read , update read status for all
    //previous messages in storage

    if (m.status == MESIBO_MSGSTATUS_READ) {

      for (var i = msgIdPos; i >= 0; i--) {
        // MesiboLog(jsonMsgArray[i]['data']);
        if (jsonMsgArray[i]['status'] == MESIBO_MSGSTATUS_DELIVERED) {
          jsonMsgArray[i]['status'] = MESIBO_MSGSTATUS_READ;
          jsonMsgArray[i]['params']['status'] = MESIBO_MSGSTATUS_READ;
        }
      }
    }

    // MesiboLog("After updateItemSent",jsonMsgArray);

    localStorage.setItem(m.peer, JSON.stringify(jsonMsgArray));

    // MesiboLog("After updateItemSent localstorage",JSON.parse(localStorage.getItem(m.peer)));

  }

  updateFileUrl(id, peer, fileUrl) {
    var retrievedMsgArray = localStorage.getItem(peer);
    //MsgList Entry Will always exist if msg sent.No need to check
    var jsonMsgArray = JSON.parse(retrievedMsgArray);
    // MesiboLog(jsonMsgArray);

    var msgIdPos = -1;


    for (var i = jsonMsgArray.length - 1; i >= 0; i--) {
      if (jsonMsgArray[i]['id'] == id) {
        jsonMsgArray[i]['fileurl'] = fileUrl;
        msgIdPos = i;
        break;
      }
    }

    if (msgIdPos == -1) {
      MesiboLog("Error:localstorage.js:updateItemSent: Message ID not found");
    }

    localStorage.setItem(peer, JSON.stringify(jsonMsgArray));

  }

  updateItemRecieved(m, string) {
    MesiboLog("===>LocalStorage_UpdateItemRecieved called");
    var retrievedMsgArray = localStorage.getItem(m.peer);
    var jsonMsgArray = [];

    if (retrievedMsgArray)
      jsonMsgArray = JSON.parse(retrievedMsgArray);

    jsonMsgArray.push({
      'id': m.id,
      'peer': m.peer,
      'params': m,
      'data': string,
      'groupid': 0,
      'ts': +new Date,
      'flag': m.flag,
      'origin': MESIBO_MSG_ORIGIN_RECIEVED
    });
    localStorage.setItem(m.peer, JSON.stringify(jsonMsgArray));
  }

  newItemSent(id, peer, msg_payload) {
    MesiboLog("===>LocalStorage_NewItemSent called");
    var retrievedMsgArray = localStorage.getItem(peer);

    if (retrievedMsgArray)
      retrievedMsgArray = JSON.parse(retrievedMsgArray);
    else
      retrievedMsgArray = [];

    retrievedMsgArray.push(msg_payload);
    localStorage.setItem(peer, JSON.stringify(retrievedMsgArray));

    MesiboLog(JSON.parse(localStorage.getItem(peer)));
  }


  msgPeerHash(msgId, peer) {
    var retrievedMsgHash = localStorage.getItem("Mesibo_MsgUsr_Hash");
    if (retrievedMsgHash)
      retrievedMsgHash = JSON.parse(retrievedMsgHash);
    else
      retrievedMsgHash = {};

    retrievedMsgHash[msgId] = peer;
    localStorage.setItem("Mesibo_MsgUsr_Hash", JSON.stringify(retrievedMsgHash));


  }

}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}