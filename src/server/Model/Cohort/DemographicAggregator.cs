﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Cohort;
using System.Collections.Generic;

namespace Model.Cohort
{
    public class DemographicAggregator
    {
        const string Female = "Female";
        const string Male = "Male";

        readonly BinarySplitPair GenderSplit = new BinarySplitPair
        {
            Category = "Gender",
            Left = new BinarySplit { Label = Female, Value = 0 },
            Right = new BinarySplit { Label = Male, Value = 0 }
        };

        readonly BinarySplitPair VitalSplit = new BinarySplitPair
        {
            Category = "VitalStatus",
            Left = new BinarySplit { Label = "Living", Value = 0 },
            Right = new BinarySplit { Label = "Deceased", Value = 0 }
        };

        readonly BinarySplitPair AARPSplit = new BinarySplitPair
        {
            Category = "AARP",
            Left = new BinarySplit { Label = "65 and Older", Value = 0 },
            Right = new BinarySplit { Label = "Under 65", Value = 0 }
        };

        readonly BinarySplitPair HispanicSplit = new BinarySplitPair
        {
            Category = "Hispanic",
            Left = new BinarySplit { Label = "Hispanic", Value = 0 },
            Right = new BinarySplit { Label = "Not Hispanic", Value = 0 }
        };

        readonly BinarySplitPair MarriedSplit = new BinarySplitPair
        {
            Category = "Married",
            Left = new BinarySplit { Label = "Married", Value = 0 },
            Right = new BinarySplit { Label = "Not Married", Value = 0 }
        };

        readonly DistributionData<AgeByGenderBucket> AgeBreakdown = new DistributionData<AgeByGenderBucket>(ageBuckets);

        readonly VariableBucketSet LanguageByHeritage = new VariableBucketSet();

        readonly Dictionary<string,int> Religion = new Dictionary<string, int>();
        readonly Dictionary<string,int> Sex = new Dictionary<string, int>();
        readonly Dictionary<string,int> Gender = new Dictionary<string, int>();
        readonly Dictionary<string,int> Age = new Dictionary<string, int>();

        readonly NihRaceEthnicityBuckets NihRaceEthnicity = new NihRaceEthnicityBuckets();

        readonly IEnumerable<PatientDemographic> cohort;

        public DemographicAggregator(PatientDemographicContext context)
        {
            cohort = context.Cohort;
        }

        public DemographicAggregator(IEnumerable<PatientDemographic> patients)
        {
            cohort = patients;
        }

        public DemographicStatistics Aggregate()
        {
            foreach (var patient in cohort)
            {
                RecordGenderAgeAARP(patient);
                RecordVitalStatus(patient);
                RecordHispanic(patient);
                RecordMarried(patient);
                RecordLanguageByHeritage(patient);
                RecordReligion(patient);
                RecordSex(patient);
                RecordGender(patient);
                RecordNih(patient);
                RecordAge(patient);
            }

            return new DemographicStatistics
            {
                BinarySplitData = new List<BinarySplitPair> { GenderSplit, VitalSplit, AARPSplit, HispanicSplit, MarriedSplit },
                AgeByGenderData = AgeBreakdown,
                LanguageByHeritageData = LanguageByHeritage,
                ReligionData = Religion,
                GenderData = Gender,
                NihRaceEthnicityData = NihRaceEthnicity,
                SexData = Sex,
                AgeData = Age
            };
        }

        readonly static string[] femaleSynonyms = { "f", "female" };
        readonly static string[] maleSynonyms = { "m", "male" };

        bool IsFemale(PatientDemographic patient)
        {
            return femaleSynonyms.Any(s => s.Equals(patient.Sex, StringComparison.InvariantCultureIgnoreCase));
        }

        bool IsMale(PatientDemographic patient)
        {
            return maleSynonyms.Any(s => s.Equals(patient.Sex, StringComparison.InvariantCultureIgnoreCase));
        }

        BinarySplit RecordVitalStatus(PatientDemographic patient)
        {
            if (!patient.IsDeceased.HasValue)
            {
                return null;
            }

            BinarySplit side = VitalSplit.Left;

            if (patient.IsDeceased.Value)
            {
                side = VitalSplit.Right;
            }

            side.Value++;
            return side;
        }

        BinarySplit RecordHispanic(PatientDemographic patient)
        {
            if (!patient.IsHispanic.HasValue)
            {
                return null;
            }

            BinarySplit side = HispanicSplit.Right;

            if (patient.IsHispanic.Value)
            {
                side = HispanicSplit.Left;
            }

            side.Value++;
            return side;
        }

        BinarySplit RecordMarried(PatientDemographic patient)
        {
            if (!patient.IsMarried.HasValue)
            {
                return null;
            }

            BinarySplit side = MarriedSplit.Right;

            if (patient.IsMarried.Value)
            {
                side = MarriedSplit.Left;
            }

            side.Value++;
            return side;
        }

        void RecordLanguageByHeritage(PatientDemographic patient)
        {
            LanguageByHeritage.Increment(patient.Race, patient.Language);
        }

        void RecordReligion(PatientDemographic patient)
        {
            if (string.IsNullOrEmpty(patient.Religion))
            {
                return;
            }

            var religion = patient.Religion.ToLowerInvariant();

            if (Religion.ContainsKey(religion))
            {
                Religion[religion]++;
                return;
            }
            Religion.Add(religion, 1);
        }

         void RecordGender(PatientDemographic patient)
        {
            if (string.IsNullOrEmpty(patient.Gender))
            {
                return;
            }

            var gender = patient.Gender.ToLowerInvariant();

            if (Gender.ContainsKey(gender))
            {
                Gender[gender]++;
                return;
            }
            Gender.Add(gender, 1);
        }

        void RecordSex(PatientDemographic patient)
        {
            if (string.IsNullOrEmpty(patient.Sex))
            {
                return;
            }

            var sex = patient.Sex.ToLowerInvariant();

            if (Sex.ContainsKey(sex))
            {
                Sex[sex]++;
                return;
            }
            Sex.Add(sex, 1);
        }

        readonly static string[] adultAgeBuckets = { "<20", "20-29", "30-39", "40-49", "50-59", "60-69", ">=70"};
        void RecordAge(PatientDemographic patient)
        {
            if (String.IsNullOrEmpty(patient.Age?.ToString()))
            {
                return;
            }
            var age = "";
            if (patient.Age < 20) {
                age = adultAgeBuckets[0];
            } else if (patient.Age >= 20 && patient.Age < 30) {
                age = adultAgeBuckets[1];
            } else if (patient.Age >= 30 && patient.Age < 40) {
                age = adultAgeBuckets[2];
            } else if (patient.Age >= 40 && patient.Age < 50) {
                age = adultAgeBuckets[3];
            } else if (patient.Age >= 50 && patient.Age < 60) {
                age = adultAgeBuckets[4];
            } else if (patient.Age >= 60 && patient.Age < 70) {
                age = adultAgeBuckets[5];
            } else if (patient.Age >= 70) {
                age = adultAgeBuckets[6];
            }

            if (Age.ContainsKey(age))
            {
                Age[age]++;
                return;
            }
            if (String.IsNullOrEmpty(age))
            {
                return;
            }
            Age.Add(age, 1);
        }

        void RecordNih(PatientDemographic patient)
        {
            if (string.IsNullOrEmpty(patient.Race))
            {
                return;
            }

            var race = patient.Race.ToLowerInvariant();

            if (!NihRaceEthnicity.EthnicBackgrounds.ContainsKey(race))
            {
                NihRaceEthnicity.EthnicBackgrounds.Add(race, new NihRaceEthnicityBucket());
            }

            var bucket = NihRaceEthnicity.EthnicBackgrounds[race];
            if (patient.IsHispanic.HasValue)
            {
                if (patient.IsHispanic.Value)
                {
                    if (IsFemale(patient))    { bucket.Hispanic.Females += 1; }
                    else if (IsMale(patient)) { bucket.Hispanic.Males += 1;   }
                    else                      { bucket.Hispanic.Others += 1;  }
                }
                else
                {
                    if (IsFemale(patient))    { bucket.NotHispanic.Females += 1; }
                    else if (IsMale(patient)) { bucket.NotHispanic.Males += 1;   }
                    else                      { bucket.NotHispanic.Others += 1;  }
                }
            }
            else
            {
                if (IsFemale(patient))        { bucket.Unknown.Females += 1; }
                else if (IsMale(patient))     { bucket.Unknown.Males += 1;   }
                else                          { bucket.Unknown.Others += 1;  }
            }
        }

        readonly static string[] ageBuckets = { "<1", "1-9", "10-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75-84", ">84" };
        readonly static KeyValuePair<Func<int, bool>, string>[] ageSwitch =
        {
            new KeyValuePair<Func<int, bool>, string>(x => x < 1, ageBuckets[0]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 1 && x <= 9, ageBuckets[1]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 10 && x <= 17, ageBuckets[2]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 18 && x <= 24, ageBuckets[3]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 25 && x <= 34, ageBuckets[4]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 35 && x <= 44, ageBuckets[5]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 45 && x <= 54, ageBuckets[6]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 55 && x <= 64, ageBuckets[7]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 65 && x <= 74, ageBuckets[8]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 75 && x <= 84, ageBuckets[9]),
            new KeyValuePair<Func<int, bool>, string>(x => x > 84, ageBuckets[10]),
        };

        AgeByGenderBucket AgeToBucket(int? age)
        {
            if (!String.IsNullOrEmpty(age?.ToString())) {
                return AgeBreakdown.GetBucket(ageSwitch.First(sw => sw.Key(0)).Value);
            }
            var name = ageSwitch.First(sw => sw.Key((int)age)).Value;
            return AgeBreakdown.GetBucket(name);
        }

        void RecordGenderAgeAARP(PatientDemographic patient)
        {
            void aarp(int? age)
            {
                if (String.IsNullOrEmpty(age.ToString())) {
                    return;
                }
                if (age >= 65)
                {
                    AARPSplit.Left.Value++;
                }
                else
                {
                    AARPSplit.Right.Value++;
                }
            }

            BinarySplit gender = null;
            Action<AgeByGenderBucket> increment = (bucket) => { bucket.Others++; };
            if (IsFemale(patient))
            {
                gender = GenderSplit.Left;
                increment = (bucket) => { bucket.Females++; };
            }
            else if (IsMale(patient))
            {
                gender = GenderSplit.Right;
                increment = (bucket) => { bucket.Males++; };
            }

            var boxed = patient.Age;
          //  if (boxed.HasValue)
            if (!String.IsNullOrEmpty(boxed.ToString()))
            {
               // var age = boxed.Value;
                //var age = boxed;
                if (!String.IsNullOrEmpty(boxed.ToString())) {
                    aarp(boxed);
                    var bucket = AgeToBucket(boxed);
                    increment(bucket);
                }
            }

            if (gender != null)
            {
                gender.Value++;
            }
        }


    }
}
