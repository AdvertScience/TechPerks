var express = require('express');
var router = express.Router();
// var helperCrud = require("../../helpers/ai/helpers/crud");
var validate = require("../../../helpers/validate");

router.post('/helpers/sync-helper', validate, async function(req, res, next) {

  const { helperId, agentId, modelId, systemRole, userRole, weight, temperature, tokens, modelUrl, apiKey } = req.body;
  // let helperData = {
  //   agentId: agentId,
  //   modelId: modelId,
  //   systemRole: systemRole,
  //   userRole: userRole,
  //   weight: weight,
  //   temperature: temperature,
  //   tokens: tokens,
  //   modelUrl: modelUrl,
  //   apiKey: apiKey
  // };

  // helperCrud.createHelper(helperId, helperData).then(async () => {
  //   helperCrud.createHelper(helperId, helperData);
  //   res.sendStatus(200);  
  // });

});

module.exports = router;
