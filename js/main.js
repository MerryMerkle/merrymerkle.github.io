var RECENT_DONATION = 'RECENT_DONATION'
var LEADERBOARD = 'LEADERBOARD'
var TREE_LEADERBOARD = 'TREE_LEADERBOARD'
var TIER_REACHED = 'TIER_REACHED'
var TOTAL_DONATION_VALUE = 'TOTAL_DONATION_VALUE'

var socketServer = 'ws://merrymerkle.intransit.xyz'
// var socketServer = 'wss://b29b0483.ngrok.io'

$(document).ready(function () {

  window.socket = io(socketServer)
  window.socket.on('error', console.error.bind(console))
  window.socket.on('connect', console.log.bind(console))
  window.socket.on('event', console.log.bind(console))
  window.socket.on('disconnect', console.log.bind(console))

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
      .toFormat(4)
    bannerData.donationUSD = (new BigNumber(data.inUSD))
      .div(10 ** 18)
      .toFormat(2)
  })

  /**
   * LEADERBOARD STUFF
   */

  window.socket.on(RECENT_DONATION, console.log.bind(console))
  window.socket.on(LEADERBOARD, console.log.bind(console))

  // Vue.component('donor', {
  //   props: ['donor'],
  //   template: '<li>{{donor.name ? donor.name : donor.donor }} - {{ donor.value }}</li>'
  // })


  var leaderboard = new Vue({
    el: '#leaderboard-hook',
    data: {
      leaderboard: [
        { donor: '0xabcd', value: '1231254', name: null },
        { donor: '0xefgh', value: '1231254', name: null },
        { donor: '0xjklm', value: '1231254', name: 'test aname' },
      ]
    }
  })


  /**
   * TREE STUFF
   */

  window.socket.on(LEADERBOARD, console.log.bind(console))
  window.socket.on(TIER_REACHED, console.log.bind(console))
})