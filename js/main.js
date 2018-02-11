var RECENT_DONATION = 'RECENT_DONATION'
var LEADERBOARD = 'LEADERBOARD'
var TREE_LEADERBOARD = 'TREE_LEADERBOARD'
var TIER_REACHED = 'TIER_REACHED'
var TOTAL_DONATION_VALUE = 'TOTAL_DONATION_VALUE'


var apiServer = 'https://128.199.209.90'
var socketServer = 'wss://' + apiServer
var httpApiServer = 'https://' + apiServer

const DONATE_TO = "0x1D348f7721Ccc4beA2c4292cea27c94B5883EBd3";

$(document).ready(function () {

  window.socket = io(socketServer)
  window.socket.on('error', console.error.bind(console))
  window.socket.on('connect', console.log.bind(console))
  window.socket.on('event', console.log.bind(console))
  window.socket.on('disconnect', console.log.bind(console))

  var $banner = $('.donation-banner')

  var handleRecentDonation = function (data) {
    var displayETH = (new BigNumber(data.value)).div(10 ** 18).toFormat(4)
    var truncatedAddress = data.donor.slice(0, 12) + '...'
    $banner
      .html('<strong>New donation of ' + displayETH + ' ETH from ' + truncatedAddress + '!</strong>')
      .animate({
        height: '141px'
      })

    setTimeout(function () {
      $banner.animate({
        height: '0px',
      })
    }, 8 * 1000)
  }

  window.socket.on(RECENT_DONATION, handleRecentDonation)

  /**
   * formatters
   */

  var formatRawLeaderboardData = function (datas) {
    for (var i = 0; i < datas.length; i++) {
      const leader = datas[i]
      leader.addr = leader.donor
      leader.truncatedAddress = leader.donor.slice(0, 12) + '...'
      leader.displayETH = (new BigNumber(leader.value)).div(10 ** 18).toFormat(4)
      leader.text = leader.name ? leader.name.slice(0, 40) : leader.addr
    }

    if (datas.length < 40) {
      for (let i = 0; i < 40 - datas.length; i++) {
        datas.push({
          blank: true,
          displayETH: '0.0000',
          text: 'Unclaimed!'
        })
      }
    }

    return datas
  }

  /**
   * BANNER STUFF
   */

  var bannerData = {
    donationETH: 'Loading... 0.0000',
    donationCAD: '0.00'
  }

  var banner = new Vue({
    el: '#banner-hook',
    data: bannerData
  })

  window.socket.on(TOTAL_DONATION_VALUE, function (data) {
    bannerData.donationETH = (new BigNumber(data.value))
      .div(10 ** 18)
      .toFormat(4)
    bannerData.donationCAD = (new BigNumber(data.inCAD))
      .div(10 ** 18)
      .toFormat(2)
  })

  /**
   * LEADERBOARD STUFF
   */

  var leaderboardData = {
    browserInstalled: false,
    addrSigned: false,
    hovered: -1,
    name: '',
    amount: '0.2',
    leaderboard: [
      {
        text: 'Loading...',
        displayETH: '0.0000'
      }
    ],
    messages: [],
  }

  if (typeof web3 !== 'undefined') {
    leaderboardData.browserInstalled = true
    web3 = new Web3(web3.currentProvider)
  }

  window.socket.on(RECENT_DONATION, console.log.bind(console))

  var leaderboard = new Vue({
    el: '#leaderboard-hook',
    data: leaderboardData,
    methods: {
      message: function(msg) {
        this.messages.push(msg)
      },
      onDonate: function(event) {
        window.web3.eth.sendTransaction({
          from: this.addrSigned,
          to: DONATE_TO,
          value: web3.toWei(leaderboard.amount, 'ether'),
        }, function(err, result) {
          if (err) {
            leaderboard.message('Transaction failed: ' + err)
            console.error(err)
            return
          }
          leaderboard.message('Donation sent! It should arrive soon.')
        })
      },
      onNameSubmit: function (event) {
        if (!this.name.length) {
          return
        }

        const name = this.name
        window.web3.eth.getAccounts(function (err, result) {
          if (err) {
            leaderboard.message('No account available: ' + err)
            return
          }
          if (result.length == 0) {
            leaderboard.message('No account available. Please create or unlock an Ethereum wallet first.')
            return;
          }
          const addr = result[0];
          const hexName = window.web3._extend.utils.toHex(name);
          window.web3.personal.sign(hexName, addr, function (err, sig) {
            if (err) {
              leaderboard.message('Message signing failed: ' + err)
              console.error(err)
              return
            }

            $.ajax({
              url: httpApiServer + '/name',
              method: 'POST',
              data: {
                name: name,
                data: hexName,
                addr: addr,
                sig: sig
              },
              success: function () {
                leaderboard.messages = [] // Reset.
                leaderboard.message('Success! Name registered to address: ' + addr)
                leaderboard.name = ''
                leaderboard.addrSigned = addr
              }
            })
          })
        })
      }
    }
  })

  window.socket.on(LEADERBOARD, function (data) {
    leaderboardData.leaderboard = formatRawLeaderboardData(data.leaderboard)
  })



















  /**
   * tree
   */

  /**
   * util fns
   */

  var tooltipHtml = function (data) {
    if (data.blank) {
      return 'Unclaimed!'
    }

    // @TODO - make sure we don't get XSS'd here
    return '三' + data.displayETH + 'ETH' + '</br>' + data.truncatedAddress
  }


  var initData = [];
  for(i = 0; i < 31; i++) {
      initData.push({
          blank: true,
          text: 'Loading...',
          value: '0.0000',
          address: "0x01234556"
      })
  }

  /**
   * d3 logic
   */

  let example = d3.select("#tree-hook")

  let w = '100%', h = '100%';

  var canvas = example
  .append('svg')
  .attr('width', w)
  .attr('height', h)

  // Define the div for the tooltip
  var div = example.append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  function appendLeaf(node, x, y, data, i) {
      if(i == 0) {
          node
          .append("circle")
          .text(data.text)
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 30)
          .style("fill", "yellow")
          .on("mouseover", function(d) {
              leaderboardData.hovered = i
              div.transition()
                  .duration(200)
                  .style("opacity", .9);
              div .html(tooltipHtml(data))
                  .style("left",  d3.select(this).attr("cx") + "px")
                  .style("top", d3.select(this).attr("cy") + "px");
              })
          .on("mouseout", function(d) {
              leaderboardData.hovered = -1
              div.transition()
                  .duration(500)
                  .style("opacity", 0);
          });
      } else {
          node
          .append("circle")
          .text(data.text)
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 15)
          .style("fill", Math.floor(Math.random() * 2) % 2 == 0 ? "red" : "green")
          .on("mouseover", function(d) {
              leaderboardData.hovered = i
              div.transition()
                  .duration(200)
                  .style("opacity", .9);
              div .html(tooltipHtml(data))
                  .style("left", d3.select(this).attr("cx") + "px")
                  .style("top", d3.select(this).attr("cy") + "px");
              })
          .on("mouseout", function(d) {
              leaderboardData.hovered = -1
              div.transition()
                  .duration(500)
                  .style("opacity", 0);
          });
      }
  }

  function appendBranch(node, x1, y1, x2, y2) {
      node
      .append("line")
      .style("stroke", "green")
      .attr('stroke-width', 5)
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
  }

  indices = [[0], [1, 2], [3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13, 14], [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]];

  leaves = [];
  branches = [];

  function generateCoordinates(xspace, yspace, x, y) {
      let n = 0;
      for(i = 0; i < indices.length; i++) {
          for(j = 0; j < indices[i].length; j++) {
              if (i == 0) {
                  leaves.push({x: x, y: y, i: n})
              } else {
                  if(n % 2 == 0) {
                      //go right
                      let k = indices[i-1].indexOf((n/2)-1);
                      let parentIndex = indices[i-1][k];
                      let parent = leaves[parentIndex];
                      let leaf = {
                        x: parent.x + (xspace / (i)),
                        y: y + (i * yspace),
                        i: n
                      }
                      leaves.push(leaf)
                      branches.push({x1: parent.x, y1: parent.y, x2: leaf.x, y2: leaf.y})
                  } else {
                      //go left
                      let k = indices[i-1].indexOf(Math.floor(n/2))
                      let parentIndex = indices[i-1][k];
                      let parent = leaves[parentIndex];
                      let leaf = {
                        x: parent.x - (xspace / (i)),
                        y: y + (i * yspace),
                        i: n
                      }
                      leaves.push(leaf)
                      branches.push({x1: parent.x, y1: parent.y, x2: leaf.x, y2: leaf.y})
                  }
              }
              n++;
          }
      }
  }

  function updateTree(data) {
      canvas.selectAll('circle').remove();
      for(i = 0; i < leaves.length; i++) {
          appendLeaf(canvas, leaves[i].x, leaves[i].y, data[i] || initData[i], i)
      }
  }

  function initTree(data) {
      //draw branches
      for(i = 0; i < branches.length; i++) {
          appendBranch(canvas, branches[i].x1, branches[i].y1, branches[i].x2, branches[i].y2);
      }
      //draw leafs
      for(i = 0; i < leaves.length; i++) {
          appendLeaf(canvas, leaves[i].x, leaves[i].y, data[i], i)
      }
  }

  var hook = $('#tree-hook')
  generateCoordinates(
    hook.width() / 4.8,
    hook.height() / 5,
    hook.width() / 2.0,
    hook.height() * 0.10
  );
  initTree(initData);

  window.socket.on(TREE_LEADERBOARD, function (data) {
    updateTree(formatRawLeaderboardData(data.leaderboard))
  })

  window.socket.on(TIER_REACHED, function (data) {

  })
})
