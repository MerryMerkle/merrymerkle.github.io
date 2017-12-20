var RECENT_DONATION = 'RECENT_DONATION'
var LEADERBOARD = 'LEADERBOARD'
var TREE_LEADERBOARD = 'TREE_LEADERBOARD'
var TIER_REACHED = 'TIER_REACHED'
var TOTAL_DONATION_VALUE = 'TOTAL_DONATION_VALUE'

var socketServer = 'merrymerkle.intransit.xyz'

$(document).ready(function () {

  window.socket = io(socketServer)

  /**
   * BANNER STUFF
   */

  let bannerData = {
    donationETH: 'Loading...',
    donationUSD: '0'
  }

  var banner = new Vue({
    el: '#banner-hook',
    data: bannerData
  })

  window.socket.on(TOTAL_DONATION_VALUE, function (data) {
    bannerData.donationETH = (new BigNumber(data.value))
      .div(10 ** 18)
      .toFormat(1)
    bannerData.donationUSD = (new BigNumber(data.inUSD))
      .div(10 ** 18)
      .toFormat(2)
  })

  /**
   * LEADERBOARD STUFF
   */
   
  window.socket.on(RECENT_DONATION, function(data){
   var recentDonationList = '';
    for(i = 0; i < data.length; i++){
        recentDonationList += '<li>' + (data[i].name ? data[i].name : data[i].donor) 
                            + " " + data[i].value + '</li>';
    }
    $("#recent-donation-hook").html(recentDonationList);
  });

  window.socket.on(LEADERBOARD, function(data){
   console.log()
    var leaderboardList = '';
    for(i = 0; i < data.length; i++){
        leaderboardList += '<li>' + (data[i].name ? data[i].name : data[i].donor) 
                            + " " + data[i].value + '</li>';
    }
    $("#leaderboard-hook").html(leaderboardList);
  });

  // Vue.component('donor', {
  //   props: ['donor'],
  //   template: '<li>{{donor.name ? donor.name : donor.donor }} - {{ donor.value }}</li>'
  // })
  

  // var leaderboard = new Vue({
  //   el: '#leaderboard-hook',
  //   data: {
  //     leaderboard: [
  //       { donor: '0xabcd', value: '1231254', name: null },
  //       { donor: '0xefgh', value: '1231254', name: null },
  //       { donor: '0xjklm', value: '1231254', name: 'test aname' },
  //     ]
  //   }
  // });


  /**
   * TREE STUFF
   */

  window.socket.on(LEADERBOARD, console.log.bind(console))
  window.socket.on(TIER_REACHED, console.log.bind(console))
});