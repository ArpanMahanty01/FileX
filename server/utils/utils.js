const os = require('os');

exports.getPrivateIP = () => {
  const interfaces = os.networkInterfaces();
  const PrivateIP = interfaces['enp2s0'][0].address;
  return PrivateIP;
};

exports.getUserName = () => {

    const username = os.userInfo().username;
    return username;
};
