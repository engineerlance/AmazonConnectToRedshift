const { v5: uuidv5 } = require("uuid");
let concatenatedObject = "";

module.exports = objectBuilder = {
  BuildRedshiftObject: (parsedObject) => {
    for (const CTR of parsedObject) {
      let conformedObjectInstance = {};
      if (CTR.Agent)
        conformedObjectInstance.Agent = {
          AgentId: CTR.Agent.ARN,
          AgentUserName: CTR.Agent.Username,
        };
      if (CTR.Queue)
        conformedObjectInstance.Queue = {
          QueueId: CTR.Queue.ARN,
          QueueName: CTR.Queue.Name,
        };
      if (CTR.CustomerEndpoint)
        conformedObjectInstance.Customer = {
          CustomerId: uuidv5(CTR.CustomerEndpoint.Type + CTR.CustomerEndpoint.Address, uuidv5.URL),
          Type: CTR.CustomerEndpoint.Type,
          Address: CTR.CustomerEndpoint.Address,
        };
      conformedObjectInstance.CTRRecord = {
        RecordId: CTR.ContactId,
        LastUpdateTimestamp: CTR.LastUpdateTimestamp,
        AWSAccountId: CTR.AWSAccountId,
        ...((CTR.Agent && { AgentId: CTR.Agent.ARN }) || { AgentId: null }),
        ...((CTR.Queue && { QueueId: CTR.Queue.ARN }) || { QueueId: null }),
        ...((CTR.Recordings && { WithVoiceMail: true }) || { WithVoiceMail: false }),
        ...((CTR.CustomerEndpoint && {
          CustomerId: uuidv5(CTR.CustomerEndpoint.Type + CTR.CustomerEndpoint.Address, uuidv5.URL),
        }) || { CustomerId: null }),
        Channel: CTR.Channel,
        ...((CTR.Agent && { AgentInteractionDuration: CTR.Agent.AgentInteractionDuration }) || {
          AgentInteractionDuration: null,
        }),
        ...((CTR.Agent && { CustomerHoldDuration: CTR.Agent.CustomerHoldDuration }) || {
          CustomerHoldDuration: null,
        }),
        ConnectedTimestamp: CTR.ConnectedToSystemTimestamp,
        DisconnectTimestamp: CTR.DisconnectTimestamp,
        DisconnectReason: CTR.DisconnectReason,
        CustomerIntent: CTR.Attributes.Intent,
        ...((CTR.Attributes.Intent && { CustomerIntent: CTR.Attributes.Intent }) || {
          CustomerIntent: null,
        }),
        AgentConnectionAttempts: CTR.AgentConnectionAttempts,
        InitiationMethod: CTR.InitiationMethod,
        ...((CTR.Queue && { QueueDuration: CTR.Queue.Duration }) || { QueueDuration: null }),
      };
      concatenatedObject += JSON.stringify(conformedObjectInstance);
    }

    return concatenatedObject;
  },
};
