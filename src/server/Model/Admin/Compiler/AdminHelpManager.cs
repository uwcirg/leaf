﻿// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading.Tasks;
using System.Runtime.CompilerServices;
using Microsoft.Extensions.Logging;
using Model.Error;
using Model.Validation;

namespace Model.Admin.Compiler
{
    public class AdminHelpManager
    {
        public interface IAdminHelpPageService
        {
            Task<AdminHelpPageContentSql> GetAsync(int id);
            Task<AdminHelpPageCreateUpdateSql> CreateAsync(AdminHelpPageCreateUpdateSql p);
            Task<AdminHelpPageContentSql> UpdateAsync(IEnumerable<AdminHelpPageCreateUpdateSql> contentRows);
            Task<int?> DeleteAsync(int id);
        }

        readonly ILogger<AdminHelpManager> log;
        readonly IAdminHelpPageService svc;

        public AdminHelpManager(
            ILogger<AdminHelpManager> log,
            IAdminHelpPageService svc)
        {
            this.log = log;
            this.svc = svc;
        }

        public async Task<AdminHelpPageContentSql> GetAsync(int id)
        {
            log.LogInformation("Getting help page. Id:{Id}", id);
            return await svc.GetAsync(id);
        }

        public async Task<AdminHelpPageCreateUpdateSql> CreateAsync(AdminHelpPageCreateUpdateSql p)
        {
            ThrowIfCreateInvalid(p);

            try
            {
                var created = await svc.CreateAsync(p);
                log.LogInformation("Created help page. Page:{@Page}", created);
                return created;
            }
            catch (DbException de)
            {
                log.LogError("Failed to create help page. Page:{@Page} Code:{Code} Error:{Error}", p, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<AdminHelpPageContentSql> UpdateAsync(IEnumerable<AdminHelpPageCreateUpdateSql> contentRows)
        {
            ThrowIfUpdateInvalid(contentRows);

            try
            {
                var updated = await svc.UpdateAsync(contentRows);
                log.LogInformation("Updated help page. Content:{@content}", updated);
                return updated;
            }
            catch (DbException de)
            {
                log.LogError("Failed to update help page. Content:{@ContentRows} Code:{Code} Error:{Error}", contentRows, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        public async Task<int?> DeleteAsync(int id)
        {
            Ensure.NotDefault(id, nameof(id));

            var deleted = await svc.DeleteAsync(id);
            if (deleted.HasValue)
            {
                log.LogInformation("Deleted help page. Id:{Id}", id);
            }
            else
            {
                log.LogInformation("Help page not found. Id:{Id}", id);
            }
            return deleted;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfCreateInvalid(AdminHelpPageCreateUpdateSql c)
        {
            Ensure.NotNull(c, nameof(c));
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfUpdateInvalid(IEnumerable<AdminHelpPageCreateUpdateSql> contentRows)
        {
            Ensure.NotNull(contentRows, nameof(contentRows));
        }
    }
}