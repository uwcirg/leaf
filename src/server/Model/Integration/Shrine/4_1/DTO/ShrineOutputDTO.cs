﻿// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine4_1;

namespace Model.Integration.Shrine4_1.DTO
{
	public class ShrineOutputDTO
	{
		public string EncodedClass { get; set; }

		public ShrineOutputDTO(ShrineOutput output)
		{
			EncodedClass = output.EncodedClass.ToString();
		}
    }

	public static class ShrineOutputExtensions
	{
		public static ShrineOutput ToOutput(this ShrineOutputDTO dto)
		{
			_ = Enum.TryParse(dto.EncodedClass, out ShrineOutputType type);
			return new ShrineOutput
			{
				EncodedClass = type
			};
		}
    }
}

