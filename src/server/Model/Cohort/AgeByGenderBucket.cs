// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Cohort
{
    public class AgeByGenderBucket
    {
        public int Females { get; set; }
        public int Males { get; set; }
        public int Others { get; set; }
        public int Cisman { get; set;}
        public int Ciswoman { get; set;}
        public int Transwoman { get; set;}
        public int Transman { get; set;}
        public int Mab { get; set;}
        public int Fab { get; set;}
    }
}
