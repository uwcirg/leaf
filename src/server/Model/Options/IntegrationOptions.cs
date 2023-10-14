﻿// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Options
{
    public class IntegrationOptions
	{
        public bool Enabled { get; set; } = false;
        public SHRINEOptions SHRINE { get; set; }
    }

    public class SHRINEOptions : IEnabled
    {
        public bool Enabled { get; set; } = false;
        public string HubApiURI { get; set; }
        public LocalNode Node { get; set; }
        public DefaultTopic Topic { get; set; }

        public class LocalNode
        {
            public long Id { get; set; }
            public string Name { get; set; }
        }

        public class DefaultTopic
        {
            public long Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        }
    }
}

