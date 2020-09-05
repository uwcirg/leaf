﻿// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Authorization;
using Microsoft.AspNetCore.Authorization;
using API.DTO.Compiler;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Model.Help;
using Model.Error;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Route("api/help")]
    public class HelpController : Controller
    {
        readonly ILogger<HelpController> log;
        public HelpController(ILogger<HelpController> logger)
        {
            log = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HelpPagesDTO>>> GetHelpPages(
            [FromServices] HelpPages helpPage)
        {
            try
            {
                var pages = await helpPage.GetAllPagesAsync();
                return Ok(pages.Select(p => new HelpPagesDTO(p)));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception e)
            {
                log.LogError("Failed to fetch help pages. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{pageid}/content")]
        public async Task<ActionResult<IEnumerable<HelpPageContentDTO>>> GetHelpPageContent(
            int pageid,
            [FromServices] HelpPages helpPage)
        {
            try
            {
                var content = await helpPage.GetPageContentAsync(pageid);
                return Ok(content.Select(c => new HelpPageContentDTO(c)));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception e)
            {
                log.LogError("Failed to fetch help page content. PageId:{PageId} Error:{Error}", pageid, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        // 1. HelpController - get pages, get page content
        // 2. adminhelpcontroller - create, read, update, delete
        // 3. service - which will run the SP
        //      write sp for each call- admin update call; payload of page id, content
    }
}
