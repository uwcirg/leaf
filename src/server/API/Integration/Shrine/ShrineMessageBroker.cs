﻿// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using API.DTO.Integration.Shrine;
using Microsoft.Extensions.Options;
using Model.Integration.Shrine;
using Model.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace API.Integration.Shrine
{
    public interface IShrineMessageBroker
    {
        Task<(HttpResponseMessage, ShrineDeliveryContents)> ReadHubMessageAndAcknowledge();
        Task<HttpResponseMessage> SendMessageToHub(ShrineDeliveryContents contents);
        Task<HttpResponseMessage> SendMessageToHub(long queryId, object contents, ShrineDeliveryContentsType type);
    }

    public class ShrineMessageBroker : IShrineMessageBroker
    {
        readonly HttpClient client;
        readonly ShrineIntegrationOptions opts;
        readonly int TimeOutSeconds = 5;
        readonly JsonSerializerSettings serializerSettings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        public ShrineMessageBroker(HttpClient client, IOptions<IntegrationOptions> opts)
        {
            this.client = client;
            this.opts = opts.Value.SHRINE;
        }

        public async Task<(HttpResponseMessage, ShrineDeliveryContents)> ReadHubMessageAndAcknowledge()
        {
            var req = new HttpRequestMessage
            {
                RequestUri = new Uri($"{opts.HubApiURI}/shrine-api/mom/receiveMessage/{opts.Node.Name}?timeOutSeconds={TimeOutSeconds}"),
                Method = HttpMethod.Get
            };

            var resp = await client.SendAsync(req);
            req.Dispose();
            if (!resp.IsSuccessStatusCode || resp.Content == null)
            {
                return (resp, null);
            }

            var jsonMessage = await resp.Content.ReadAsStringAsync();
            if (string.IsNullOrEmpty(jsonMessage))
            {
                return (resp, null);
            }
            var message = JsonConvert.DeserializeObject<ShrineDeliveryAttemptDTO>(jsonMessage).ToDeliveryAttempt();

            var ack = new HttpRequestMessage
            {
                RequestUri = new Uri($"{opts.HubApiURI}/shrine-api/mom/acknowledge/{message.DeliveryAttemptId.Underlying}"),
                Method = HttpMethod.Put
            };
            _ = await client.SendAsync(ack);
            ack.Dispose();

            var contents = JsonConvert.DeserializeObject<ShrineDeliveryContentsDTO>(message.Contents);

            return (resp, contents.ToContents());
        }

        public async Task<HttpResponseMessage> SendMessageToHub(long queryId, object contents, ShrineDeliveryContentsType type)
        {
            var delivery = new ShrineDeliveryContents
            {
                ContentsSubject = queryId,
                Contents = JsonConvert.SerializeObject(contents, serializerSettings),
                ContentsType = type
            };
            return await SendMessageToHub(delivery);
        }

        public async Task<HttpResponseMessage> SendMessageToHub(ShrineDeliveryContents contents)
        {
            var request = new HttpRequestMessage
            {
                RequestUri = new Uri($"{opts.HubApiURI}/shrine-api/mom/sendMessage/hub"),
                Method = HttpMethod.Put,
                Content = new StringContent(
                    JsonConvert.SerializeObject(new ShrineDeliveryContentsDTO(contents), serializerSettings),
                    Encoding.UTF8,
                    "application/x-www-form-urlencoded"
                )
            };
            var response = await client.SendAsync(request);
            request.Dispose();

            return response;
        }
    }
}

