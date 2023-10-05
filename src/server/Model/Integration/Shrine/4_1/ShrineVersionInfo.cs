﻿// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Integration.Shrine4_1
{
	public class ShrineVersionInfo
	{
		public int ProtocolVersion { get; set; }
		public int ItemVersion { get; set; }
        public string ShrineVersion { get; set; }
        public DateTime CreateDate { get; set; }
		public DateTime ChangeDate { get; set; }
	}
}

