// attach tree

// attach leaderboard

// attach donation banner

$(document).ready(function () {

  // maybe you want to use vue here?
  var banner = new Vue({
    el: '#banner-hook',
    data: {
      donationETH: '33',
      donationUSD: '56,000'
    }
  })

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
  // })
})