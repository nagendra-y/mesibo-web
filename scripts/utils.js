//utils.js      
const MESIBO_READFLAG_READRECEIPT = 1;
const MESIBO_READFLAG_SENDLAST = 2;
const MESIBO_READFLAG_FIFO = 4;
const MESIBO_READFLAG_SUMMARY = 0x10;
const MESIBO_READFLAG_SENDEOR = 0x20;
const MESIBO_READFLAG_WITHFILES = 0x80;

const MESIBO_MSGSTATUS_OUTBOX = 0
const MESIBO_MSGSTATUS_SENT = 1
const MESIBO_MSGSTATUS_DELIVERED = 2
const MESIBO_MSGSTATUS_READ = 3
const MESIBO_MSGSTATUS_RECEIVEDNEW = 0x12
const MESIBO_MSGSTATUS_RECEIVEDREAD = 0x13
const MESIBO_MSGSTATUS_CALLMISSED = 0x15
const MESIBO_MSGSTATUS_CALLINCOMING = 0x16
const MESIBO_MSGSTATUS_CALLOUTGOING = 0x17
const MESIBO_MSGSTATUS_CUSTOM = 0x20

const MESIBO_MSGSTATUS_FAIL = 0x80
const MESIBO_MSGSTATUS_USEROFFLINE = 0x81
const MESIBO_MSGSTATUS_INBOXFULL = 0x82
const MESIBO_MSGSTATUS_INVALIDDEST = 0x83
const MESIBO_MSGSTATUS_EXPIRED = 0x84
const MESIBO_MSGSTATUS_BLOCKED = 0x88


function timeNow() {
  var d = new Date();
  h = (d.getHours() < 10 ? '0' : '') + d.getHours();
  m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  return h + ':' + m;
}

function timeFromTs(ts) {
  var theDate = new Date(ts);
  dateString = theDate.toLocaleTimeString();
  return dateString.slice(0, 5);
}

function dateNow(ts) {
  var theDate = new Date(ts);
  dateString = theDate.toString();
  return dateString.slice(0, 4) + ', ' + dateString.slice(4, 10);
}

function dateYesterday(ts) {
  var today = new Date(ts);
  var yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  yesterdayString = yesterday.toString();

  return yesterdayString.slice(0, 4) + ', ' + yesterdayString.slice(4, 10);
}


function createRecievedBubble(msg_data) {
  var msgBodyDiv = document.createElement('div');
  msgBodyDiv.className = "row message-body";
  var topReceiverDiv = document.createElement('div');
  topReceiverDiv.className = 'col-sm-12 message-main-receiver'; //top receiver-div-class
  var receiverDiv = document.createElement('div');
  receiverDiv.className = 'receiver';
  var textDiv = document.createElement('div');
  textDiv.className = 'message-text';
  var timeSpan = document.createElement('span');
  timeSpan.className = 'message-time pull-right';

  var msgcontent = document.createTextNode(msg_data['data']);
  var timecontent = document.createTextNode(timeFromTs(msg_data['ts']));

  textDiv.append(msgcontent);
  timeSpan.append(timecontent);
  receiverDiv.append(textDiv);
  receiverDiv.append(timeSpan);
  topReceiverDiv.appendChild(receiverDiv);
  msgBodyDiv.appendChild(topReceiverDiv);

  var mylist = document.getElementById("conversation");
  mylist.appendChild(msgBodyDiv);

}

function createSentBubble(msg_data) {

  var msgBodyDiv = document.createElement('div');
  msgBodyDiv.className = "row message-body";
  var topSenderDiv = document.createElement('div');
  topSenderDiv.className = 'col-sm-12 message-main-sender'; //top sender-div-class
  var senderDiv = document.createElement('div');
  senderDiv.className = 'sender';
  var textDiv = document.createElement('div');
  textDiv.className = 'message-text';
  var timeSpan = document.createElement('span');
  timeSpan.className = 'message-time pull-right';

  var statusTick = document.createElement('img');
  statusTick.className = 'status_msg_img';
  updateStatusTick(statusTick, msg_data['status']);
  statusTick.setAttribute("id", msg_data['id']);

  var msgcontent = document.createTextNode(msg_data['data']);
  var timecontent = document.createTextNode(timeFromTs(msg_data['ts']));

  textDiv.append(msgcontent);
  timeSpan.append(timecontent);
  timeSpan.append(statusTick);
  senderDiv.append(textDiv);
  senderDiv.append(timeSpan);
  topSenderDiv.appendChild(senderDiv);
  msgBodyDiv.appendChild(topSenderDiv);

  var mylist = document.getElementById("conversation");
  mylist.appendChild(msgBodyDiv);

}


function createDateHeader_forHistory(msg_data, previous_date) {
  var current_date = dateNow(msg_data['ts']);
  // console.log(current date,msg_data['data'],msg_data['ts']);

  if (previous_date != current_date) {
    previous_date = current_date;
    // createDateHeaderBlock(current_date);
    // console.log("Making header for date");

    if (current_date == dateNow(+new Date()))
      createDateHeaderBlock("Today");
    else if (current_date == dateYesterday(+new Date()))
      createDateHeaderBlock("Yesterday");
    else
      createDateHeaderBlock(current_date);
  }

  return previous_date;
}

function createDateHeaderBlock(date_value) {
  var iDiv = document.createElement('div');
  iDiv.className = "row message-previous";
  var innerDiv = document.createElement('div');
  innerDiv.className = "col-sm-12 previous";
  var headerDiv = document.createElement('div');
  headerDiv.className = 'date_header';
  var datetext = document.createTextNode(date_value);

  headerDiv.append(datetext);
  innerDiv.append(headerDiv);
  iDiv.append(innerDiv);

  var mylist = document.getElementById("conversation")
  mylist.appendChild(iDiv);
}

function getUserFromPhone(phone_number, phone_book) {
  // console.log(phone_number, phone_book);
  user_list = Object.keys(phone_book);


  for (var i = 0; i < user_list.length; i++) {
    // console.log(phone_book[user_list[i]]['phone'] == phone_number)
    if (phone_book[user_list[i]]['phone'] == phone_number)
      return user_list[i];
  }

  console.log("User does not exist with phone phone number", phone_number);
  return -1;
}


function updateStatusTick(statusTick, status) {
  if (statusTick) {

    switch (status) {

      case MESIBO_MSGSTATUS_SENT:
        statusTick.setAttribute("src", "images/whatsapp_single_tick.png");
        break;

      case MESIBO_MSGSTATUS_DELIVERED:
        statusTick.setAttribute("src", "images/whatsapp_double_tick.png");
        break;


      case MESIBO_MSGSTATUS_READ:
        statusTick.setAttribute("src", "images/whatsapp_double_tick_coloured.png");
        break;

      default:
        statusTick.setAttribute("src", "images/ic_av_timer.png");

    }
  }

}

function updateScroll() {
  var objDiv = document.getElementById("conversation");
  objDiv.scrollTop = objDiv.scrollHeight;
}

function updateProfilePic(user_name, file_path) {
  document.getElementById(user_name).setAttribute("src", file_path);
}

function updateLastMsg(selected_user_name, selected_user_id) {

  var lastMsgId = String(selected_user_name) + "_LastMsg";
  var lastMsgDateId = String(selected_user_name) + "_LastDate";
  var lastMsgStatusId = String(selected_user_name) + "_LastStatus";
  console.log(lastMsgStatusId);

  var lastMsgArea = document.getElementById(lastMsgId);
  $(lastMsgId).text('');
  var lastMsgDateArea = document.getElementById(lastMsgDateId);
  $(lastMsgDateId).text('');
  var lastMsgStatusArea = document.getElementById(lastMsgStatusId);


  var retrievedMsgArray = localStorage.getItem(selected_user_id);
  retrievedMsgArray = JSON.parse(retrievedMsgArray);

  // console.log("Last Message", retrievedMsgArray);
  if (retrievedMsgArray) {
    // console.log("Last Message", retrievedMsgArray);

    var lastMsgContent = retrievedMsgArray[retrievedMsgArray.length - 1];
    if (lastMsgContent['data'].length > 20)
      lastMsgArea.innerHTML = lastMsgContent['data'].slice(0, 20) + " ...";
    else
      lastMsgArea.innerHTML = lastMsgContent['data'];


    if (dateNow(lastMsgContent['ts']) == dateYesterday(+new Date()))
      lastMsgDateArea.innerHTML = 'Yesterday';
    else if (dateNow(lastMsgContent['ts']) == dateNow(+new Date()))
      lastMsgDateArea.innerHTML = timeFromTs(lastMsgContent['ts']);
    else {
      var dateValue = new Date(lastMsgContent['ts']);
      lastMsgDateArea.innerHTML = dateValue.getDate() + "/" + (dateValue.getMonth() + 1) + "/" + dateValue.getFullYear()
    }


    if (lastMsgContent['flag'] == 3) { //Message Recieved, Don't show status tick
      lastMsgStatusArea.style.display = "none";
    } else {
      lastMsgStatusArea.style.display = "inline";
      updateStatusTick(lastMsgStatusArea, lastMsgContent['status']);
    }
  }

}

function getLastTs(selected_user_id) {
  var retrievedMsgArray = localStorage.getItem(selected_user_id);

  retrievedMsgArray = JSON.parse(retrievedMsgArray);
  if (retrievedMsgArray) {
    // console.log(retrievedMsgArray);
    var lastMsgContent = retrievedMsgArray[retrievedMsgArray.length - 1];
    return lastMsgContent['ts'];
  } else
    return 0;
}

function updateUserListOrder(phone_book) {
  var $divs = $("#UserList .row.sideBar-body");
  var TimeOrderedDivs = $divs.sort(function(a, b) {
    return getLastTs(phone_book[b.id]['phone']) - getLastTs((phone_book[a.id]['phone']));
  });
  $("#UserList").html(TimeOrderedDivs);
}

Array.prototype.contains = function(v) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === v) return true;
  }
  return false;
};

Array.prototype.unique = function() {
  var arr = [];
  for (var i = 0; i < this.length; i++) {
    if (!arr.contains(this[i])) {
      arr.push(this[i]);
    }
  }
  return arr;
}

function createContactsListDisplay(contactsArray) {
  console.log("===>createContactsListDisplay called ");
  console.log(contactsArray);
  if (contactsArray) {
    for (var i = 0; i < contactsArray.length; i++)
      createProfileBlock(contactsArray[i]);
  }

}

function getSyncPhoneBook(contactsArray) {
  console.log("===>getSyncPhoneBook called");
  //Get from LocalStorage or somewhere
  var SyncPhoneBook = {
    "917019882153": {
      "name": "Nagendra Y",
      "phone": "917019882153"
    },
    "917200721825": {
      "name": "Ankit Kumar",
      "phone": "917200721825"
    },
    "919449114208": {
      "name": "Krishna Priya",
      "phone": "919449114208"
    },
    "919113203545": {
      "name": "Yusuf Motiwala",
      "phone": "919113203545"
    },
  };

  var NewPhoneBook = {};

  if (contactsArray && SyncPhoneBook) {
    for (var i = 0; i < contactsArray.length; i++) {
      if (Object.keys(SyncPhoneBook).includes(contactsArray[i]['phone'])) {
        console.log("Make Sync")
        contactsArray[i]['name'] = SyncPhoneBook[contactsArray[i]['phone']]['name'];
        NewPhoneBook[contactsArray[i]['name']] = contactsArray[i];
      }
    }
  }
  return NewPhoneBook;

}

function createProfileBlock(profileDetails) {
  // console.log("===> createProfileBlock called ");
  rowBodyDiv = document.createElement('div');
  rowBodyDiv.className = "row sideBar-body";
  rowBodyDiv.onclick = function() {
    loadChatHistory(profileDetails['name']);
  };
  // console.log(function() { loadChatHistory(profileDetails['name'])});

  profilePicDiv = document.createElement('div');
  profilePicDiv.className = "col-sm-3 col-xs-3 sideBar-avatar";
  profilePicIconDiv = document.createElement('div');
  profilePicIconDiv.className = "avatar-icon";
  profilePic = document.createElement('img');
  if (profileDetails['photo'])
    profilePic.setAttribute("src", "https://appimages.mesibo.com/" + profileDetails['photo']);
  else
    profilePic.setAttribute("src", "images/profile/default-profile-icon-16.jpg ");

  profileNameMainDiv = document.createElement('div');
  profileNameMainDiv.className = "col-sm-9 col-xs-9 sideBar-main";
  profileNameRowDiv = document.createElement('div');
  profileNameRowDiv.className = "row";
  profileNameBlockDiv = document.createElement('div');
  profileNameBlockDiv.className = "col-sm-8 col-xs-8 sideBar-name";
  profileNameSpan = document.createElement('span');
  profileNameSpan.className = "name-meta";

  var profileNameValidText = "Unknown"
  if (profileDetails['name'])
    profileNameValidText = profileDetails['name'];

  profileNameText = document.createTextNode(profileNameValidText); //Name
  profileNameStrongText = document.createElement('strong');
  profileStatusPara = document.createElement('p');
  profileStatusText = document.createTextNode(profileDetails['status']); //Status

  profileStatusPara.append(profileStatusText);
  profileNameStrongText.append(profileNameText)
  profileNameSpan.append(profileNameStrongText);
  profileNameSpan.append(profileStatusPara);
  profileNameBlockDiv.append(profileNameSpan);
  profileNameRowDiv.append(profileNameBlockDiv);
  profileNameMainDiv.append(profileNameRowDiv);

  profilePicIconDiv.append(profilePic);
  profilePicDiv.append(profilePicIconDiv);

  rowBodyDiv.append(profilePicDiv);
  rowBodyDiv.append(profileNameMainDiv);


  var myContactsList = document.getElementById("syncedContactsList");
  myContactsList.appendChild(rowBodyDiv);

}

function createActivePeerBlock(userName, PhoneBook) {
  console.log("===>createActivePeerBlock called for", userName);

  rowBodyDiv = document.createElement('div');
  rowBodyDiv.className = "row sideBar-body";
  rowBodyDiv.onclick = function() {
    loadChatHistory(userName);
  };

  rowBodyDiv.setAttribute("id", userName);
  profilePicDiv = document.createElement('div');
  profilePicDiv.className = "col-sm-3 col-xs-3 sideBar-avatar";
  profilePicIconDiv = document.createElement('div');
  profilePicIconDiv.className = "avatar-icon";
  profilePic = document.createElement('img');
  profilePic.setAttribute('id', userName + "_ProfilePicture");
  if (PhoneBook[userName]['photo'])
    profilePic.setAttribute("src", "https://appimages.mesibo.com/" + PhoneBook[userName]['photo']);
  else
    profilePic.setAttribute("src", "images/profile/default-profile-icon-16.jpg ");

  profileNameMainDiv = document.createElement('div');
  profileNameMainDiv.className = "col-sm-9 col-xs-9 sideBar-main";
  profileNameRowDiv = document.createElement('div');
  profileNameRowDiv.className = "row";
  profileNameBlockDiv = document.createElement('div');
  profileNameBlockDiv.className = "col-sm-8 col-xs-8 sideBar-name";
  profileNameSpan = document.createElement('span');
  profileNameSpan.className = "name-meta";

  var profileNameValidText = "Unknown"
  if (userName)
    profileNameValidText = PhoneBook[userName]['name'];

  profileNameText = document.createTextNode(profileNameValidText); //Name
  profileNameStrongText = document.createElement('strong');

  profileStatusDiv = document.createElement('div');
  profileStatusTick = document.createElement('img'); //Status Tick
  profileStatusTick.className = "last_msg_status";
  profileStatusTick.setAttribute('id', userName + "_LastStatus");
  profileStatusTick.setAttribute('style', "display: none;");

  profileLastMessage = document.createElement('div');
  profileLastMessage.className = "last_msg_text";
  profileLastMessage.setAttribute('id', userName + "_LastMsg");

  profileLastDate = document.createElement('div');
  profileLastDate.className = "col-sm-4 col-xs-4 pull-right sideBar-time";
  profileLastDateSpan = document.createElement('span');
  profileLastDateSpan.className = "time-meta pull-right";
  profileLastDateSpan.setAttribute('id', userName + "_LastDate");

  profileLastDate.append(profileLastDateSpan);
  profileStatusDiv.append(profileStatusTick);
  profileStatusDiv.append(profileLastMessage);
  profileNameStrongText.append(profileNameText)
  profileNameSpan.append(profileNameStrongText);
  profileNameSpan.append(profileStatusDiv);
  profileNameBlockDiv.append(profileNameSpan);
  profileNameRowDiv.append(profileNameBlockDiv);
  profileNameRowDiv.append(profileLastDate);
  profileNameMainDiv.append(profileNameRowDiv);
  profilePicIconDiv.append(profilePic);
  profilePicDiv.append(profilePicIconDiv);
  rowBodyDiv.append(profilePicDiv);
  rowBodyDiv.append(profileNameMainDiv);

  var myActivePeerList = document.getElementById("UserList");
  myActivePeerList.appendChild(rowBodyDiv);


}

// Fetch Contacts
async function fetchContacts(usrToken, PhoneBook) {
  const response = await fetch('https://app.mesibo.com/api.php?op=getcontacts&token=' + usrToken);
  const contactsData = await response.json(); //extract JSON from the http response

  var personsOnly = contactsData['contacts'].filter(function(contact) {
    return contact.gid == 0;
  });

  PhoneBook = getSyncPhoneBook(personsOnly);
  localStorage.setItem("Mesibo_LocalPhoneBook", JSON.stringify(PhoneBook));

  // Syncing with Local Contacts
  createContactsListDisplay(Object.values(PhoneBook));
}

function displayActiveUsers(activeUserList, PhoneBook) {

  for (var i = 0; i < activeUserList.length; i++) {
    var user_name = getUserFromPhone(activeUserList[i], PhoneBook)
    createActivePeerBlock(user_name, PhoneBook);
    updateProfilePic(user_name + "_ProfilePicture", "https://appimages.mesibo.com/" + PhoneBook[user_name]['photo']);
    updateLastMsg(user_name, activeUserList[i]);
  }
}